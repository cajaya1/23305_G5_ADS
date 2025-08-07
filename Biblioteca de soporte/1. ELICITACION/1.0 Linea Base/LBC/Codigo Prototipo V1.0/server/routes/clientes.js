// routes/clientes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/', clientController.getAllClients);
router.get('/:cedula', clientController.getClientByCi);
router.post('/', clientController.createClient);
router.put('/:cedula', clientController.updateClient);
router.delete('/:cedula', clientController.deleteClient);

module.exports = router;
