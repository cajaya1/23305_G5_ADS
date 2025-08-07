const express = require('express');
const router = express.Router();
const VentaController = require('../controllers/VentaController');

// Procesar nueva venta
router.post('/', VentaController.procesarVenta);

// Obtener estadísticas de ventas
router.get('/estadisticas', VentaController.obtenerEstadisticas);

// Listar ventas con filtros
router.get('/', VentaController.listarVentas);

// Obtener venta por ID
router.get('/:id', VentaController.obtenerVentaPorId);

// Obtener venta por número de factura
router.get('/factura/:numeroFactura', VentaController.obtenerVentaPorFactura);

// Generar PDF de factura
router.get('/:id/pdf', VentaController.generarPDF);

// Cancelar venta
router.patch('/:id/cancelar', VentaController.cancelarVenta);

// Registrar cliente rápido
router.post('/cliente-rapido', VentaController.registrarClienteRapido);

module.exports = router;