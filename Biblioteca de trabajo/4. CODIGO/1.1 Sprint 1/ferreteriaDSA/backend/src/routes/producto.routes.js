const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/ProductoController');

// Crear nuevo producto
router.post('/', ProductoController.agregar);

// Listar productos
router.get('/', ProductoController.listar);

module.exports = router;
