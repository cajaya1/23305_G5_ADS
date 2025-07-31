const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');

// Crear nuevo cliente
router.post('/', ClienteController.registrar);

// Buscar cliente por cédula
router.get('/:cedula', ClienteController.buscarPorCedula);

// Listar clientes (con filtro opcional)
router.get('/', ClienteController.listar);

// Actualizar cliente por ID
router.put('/:id', ClienteController.actualizar);

// Eliminar cliente por ID
router.delete('/:id', ClienteController.eliminar);

// Listar clientes frecuentes
router.get('/frecuentes/listado', ClienteController.listarFrecuentes);

module.exports = router;
