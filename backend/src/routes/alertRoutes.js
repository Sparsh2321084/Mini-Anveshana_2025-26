/**
 * Alert Routes
 * 
 * Handles alert configuration and history
 */

const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// GET - Get all alerts
router.get('/', alertController.getAlerts);

// GET - Get active alerts
router.get('/active', alertController.getActiveAlerts);

// POST - Create/update alert configuration
router.post('/config', alertController.updateAlertConfig);

// GET - Get alert configuration
router.get('/config', alertController.getAlertConfig);

// PUT - Acknowledge alert
router.put('/:alertId/acknowledge', alertController.acknowledgeAlert);

// DELETE - Clear alert history
router.delete('/clear', alertController.clearAlertHistory);

module.exports = router;
