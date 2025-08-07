const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Ruta: POST /api/login
router.post('/login', AuthController.login);

module.exports = router;
