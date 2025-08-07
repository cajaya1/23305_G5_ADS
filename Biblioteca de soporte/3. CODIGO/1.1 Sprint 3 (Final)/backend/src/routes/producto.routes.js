const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/ProductoController');

// Crear nuevo producto
router.post('/', ProductoController.agregar);

// Listar productos
router.get('/', ProductoController.listar);

// Buscar productos
router.get('/buscar', ProductoController.buscar);

// Actualizar producto
router.put('/:id', ProductoController.actualizar);

// Eliminar producto
router.delete('/:id', ProductoController.eliminar);

module.exports = router;