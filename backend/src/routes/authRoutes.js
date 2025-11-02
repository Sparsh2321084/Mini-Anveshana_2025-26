/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST - User login
router.post('/login', authController.login);

// POST - User registration
router.post('/register', authController.register);

// POST - Refresh token
router.post('/refresh', authController.refreshToken);

// POST - Logout
router.post('/logout', authController.logout);

module.exports = router;
