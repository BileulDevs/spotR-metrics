const express = require('express');
const metricsController = require('../controllers/metrics.controller');
const router = express.Router();

router.get('/', metricsController.getAllMetrics);
router.get('/:name', metricsController.getMetricsForOneService);
router.get('/:name/:status', metricsController.getMetricsForOneServiceWithStatus);
router.get('/services', metricsController.getServices);

module.exports = router;