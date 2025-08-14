const axios = require('axios');
require('dotenv').config();

/**
 * Liste des services à monitorer, récupérée depuis les variables d'environnement
 * Format attendu: [{"name": "service1", "url": "http://service1/metrics"}, ...]
 */
const services = JSON.parse(process.env.SERVICESLIST);

/**
 * Retourne la liste de tous les services configurés
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Array} Liste des services avec leurs noms et URLs
 */
exports.getServices = (req, res) => {
  return res.status(200).send(services);
};

/**
 * Récupère toutes les métriques d'un service spécifique
 * @param {Object} req - Requête Express
 * @param {string} req.params.name - Nom du service à interroger
 * @param {Object} res - Réponse Express
 * @returns {Object} Métriques complètes du service demandé
 */
exports.getMetricsForOneService = async (req, res) => {
  // Recherche du service par nom dans la liste configurée
  const service = services.find((s) => s.name === req.params.name);

  if (!service) {
    return res.status(404).send({ error: 'Service not found' });
  }

  try {
    // Appel HTTP vers l'endpoint de métriques du service
    const response = await axios.get(service.url);
    return res.status(200).send(response.data);
  } catch (error) {
    return res
      .status(500)
      .send({
        error: `Could not fetch metrics from ${service.name}, ${error.message}`,
      });
  }
};

/**
 * Récupère les métriques d'un service filtrées par niveau de statut
 * @param {Object} req - Requête Express
 * @param {string} req.params.name - Nom du service à interroger
 * @param {string} req.params.status - Niveau de log à filtrer (info, warning, error)
 * @param {Object} res - Réponse Express
 * @returns {Array} Métriques filtrées par niveau de statut
 */
exports.getMetricsForOneServiceWithStatus = async (req, res) => {
  // Recherche du service par nom
  const service = services.find((s) => s.name === req.params.name);

  if (!service) {
    return res.status(404).send({ error: 'Service not found' });
  }

  // Validation du paramètre de statut
  const validStatuses = ['info', 'warning', 'error'];
  if (!validStatuses.includes(req.params.status)) {
    return res.status(400).send({
      error: 'Invalid status parameter. Must be one of: info, warning, error',
    });
  }

  try {
    // Récupération et filtrage des métriques par niveau
    const response = await axios.get(service.url);
    const filteredResponse = response.data.filter(
      (s) => s.level === req.params.status
    );
    return res.status(200).send(filteredResponse);
  } catch (error) {
    return res
      .status(500)
      .send({
        error: `Could not fetch metrics from ${service.name}, ${error.message}`,
      });
  }
};

/**
 * Récupère un aperçu consolidé des métriques de tous les services
 * Fournit un tableau de bord global avec compteurs par niveau de log
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Array} Statistiques agrégées de tous les services (succès, warnings, erreurs)
 */
exports.getAllMetrics = async (req, res) => {
  try {
    // Appel parallèle à tous les services pour récupérer leurs métriques
    const results = await Promise.all(
      services.map(async (service) => {
        try {
          const response = await axios.get(service.url);
          // Agrégation des métriques par niveau de log
          return {
            name: service.name,
            stats: {
              success: response.data.filter((s) => s.level === 'info').length,
              warn: response.data.filter((s) => s.level === 'warn').length,
              error: response.data.filter((s) => s.level === 'error').length,
            },
          };
        } catch (err) {
          // Gestion des services indisponibles
          return {
            name: service.name,
            error: `Error fetching metrics: ${err.message}`,
          };
        }
      })
    );
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch metrics from services' });
  }
};