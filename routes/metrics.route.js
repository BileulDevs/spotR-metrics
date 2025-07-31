const express = require('express');
const metricsController = require('../controllers/metrics.controller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Metrics
 *     description: Statistiques et suivi des services
 */

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     tags:
 *       - Metrics
 *     summary: Récupérer toutes les métriques disponibles
 *     responses:
 *       200:
 *         description: Liste complète des métriques
 */
router.get('/', metricsController.getAllMetrics);

/**
 * @swagger
 * /api/metrics/services:
 *   get:
 *     tags:
 *       - Metrics
 *     summary: Récupérer la liste des services disponibles
 *     responses:
 *       200:
 *         description: Liste des services connus
 */
router.get('/services', metricsController.getServices);

/**
 * @swagger
 * /api/metrics/{name}:
 *   get:
 *     tags:
 *       - Metrics
 *     summary: Récupérer les métriques pour un service spécifique
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du service
 *     responses:
 *       200:
 *         description: Métriques du service
 *       404:
 *         description: Service non trouvé
 */
router.get('/:name', metricsController.getMetricsForOneService);

/**
 * @swagger
 * /api/metrics/{name}/{status}:
 *   get:
 *     tags:
 *       - Metrics
 *     summary: Récupérer les métriques pour un service avec un statut donné
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du service
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [success, warning, error]
 *         description: Statut du service
 *     responses:
 *       200:
 *         description: Métriques du service avec le statut donné
 *       404:
 *         description: Données non trouvées
 */
router.get('/:name/:status', metricsController.getMetricsForOneServiceWithStatus);

module.exports = router;
