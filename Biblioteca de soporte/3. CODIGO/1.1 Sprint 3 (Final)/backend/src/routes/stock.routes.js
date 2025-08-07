const express = require('express');
const router = express.Router();
const StockController = require('../controllers/StockController');

// Obtener resumen completo del inventario
router.get('/resumen', StockController.obtenerResumenInventario);

// Verificar stock de un producto por ID o código
router.get('/verificar/:identificador', StockController.verificarStock);

// Obtener productos por nivel de stock (critico, bajo, medio, alto)
router.get('/nivel/:nivel', StockController.obtenerProductosPorNivel);

// Actualizar stock manualmente
router.put('/:id', StockController.actualizarStock);

// Incrementar stock
router.patch('/:id/incrementar', StockController.incrementarStock);

// Decrementar stock
router.patch('/:id/decrementar', StockController.decrementarStock);

module.exports = router;