const axios = require("axios");
require("dotenv").config();

const services = JSON.parse(process.env.SERVICESLIST);

exports.getServices = (req, res) => {
  return res.status(200).send(services);
}

exports.getMetricsForOneService = async (req, res) => {
    const service = services.find(s => s.name === req.params.name);
  
    if (!service) {
      return res.status(404).send({ error: 'Service not found' });
    }
  
    try {
      const response = await axios.get(service.url);
      return res.status(200).send(response.data);
    } catch (error) {
      return res.status(500).send({ error: `Could not fetch metrics from ${service.name}, ${error.message}` });
    }
}

exports.getMetricsForOneServiceWithStatus = async (req, res) => {
    const service = services.find(s => s.name === req.params.name);
  
    if (!service) {
      return res.status(404).send({ error: 'Service not found' });
    }
    
    const validStatuses = ['info', 'warning', 'error'];
    if (!validStatuses.includes(req.params.status)) {
      return res.status(400).send({ 
        error: 'Invalid status parameter. Must be one of: info, warning, error' 
      });
    }
  
    try {
      const response = await axios.get(service.url);
      const filteredResponse = response.data.filter(s => s.level === req.params.status);
      return res.status(200).send(filteredResponse);
    } catch (error) {
      return res.status(500).send({ error: `Could not fetch metrics from ${service.name}, ${error.message}` });
    }
}

exports.getAllMetrics = async (req, res) => {
    try {
      const results = await Promise.all(
        services.map(async (service) => {
          try {
            const response = await axios.get(service.url);
            return {
              name: service.name,
              stats: {
                success: response.data.filter(s => s.level === "info").length,
                warn: response.data.filter(s => s.level === "warn").length,
                error: response.data.filter(s => s.level === "error").length,
              }
            };
          } catch (err) {
            return {
              name: service.name,
              error: `Error fetching metrics: ${err.message}`
            };
          }
        })
      );
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch metrics from services' });
    }
  };
  