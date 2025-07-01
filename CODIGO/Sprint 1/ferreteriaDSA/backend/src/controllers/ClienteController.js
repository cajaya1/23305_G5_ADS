const ClienteFacade = require('../facades/ClienteFacade');

const ClienteController = {
  async registrar(req, res) {
    try {
      const resultado = await ClienteFacade.registrar(req.body);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al registrar cliente:', err);
      return res.status(500).json({ message: 'Error interno al registrar cliente.' });
    }
  },

  async buscarPorCedula(req, res) {
    try {
      const resultado = await ClienteFacade.buscarPorCedula(req.params.cedula);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al buscar cliente:', err);
      return res.status(500).json({ message: 'Error interno al buscar cliente.' });
    }
  },

  async listar(req, res) {
    try {
      const filtro = req.query.filtro || '';
      const clientes = await ClienteFacade.listar(filtro);
      return res.status(200).json({ success: true, data: clientes });
    } catch (err) {
      console.error('Error al listar clientes:', err);
      return res.status(500).json({ message: 'Error interno al listar clientes.' });
    }
  },

  async actualizar(req, res) {
    try {
      const resultado = await ClienteFacade.actualizar(req.params.id, req.body);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al actualizar cliente:', err);
      return res.status(500).json({ message: 'Error interno al actualizar cliente.' });
    }
  },

  async eliminar(req, res) {
    try {
      const resultado = await ClienteFacade.eliminar(req.params.id);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      return res.status(500).json({ message: 'Error interno al eliminar cliente.' });
    }
  },

  async listarFrecuentes(req, res) {
    try {
      const clientes = await ClienteFacade.listarFrecuentes();
      return res.status(200).json({ success: true, data: clientes });
    } catch (err) {
      console.error('Error al listar clientes frecuentes:', err);
      return res.status(500).json({ message: 'Error interno al listar clientes frecuentes.' });
    }
  }
};

module.exports = ClienteController;
