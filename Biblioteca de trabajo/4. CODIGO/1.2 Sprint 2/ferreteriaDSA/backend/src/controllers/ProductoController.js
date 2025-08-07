const ProductoFacade = require('../facades/ProductoFacade');

const ProductoController = {
  async agregar(req, res) {
    try {
      const resultado = await ProductoFacade.agregar(req.body);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al agregar producto:', err);
      return res.status(500).json({ message: 'Error interno al agregar el producto.' });
    }
  },

  async listar(req, res) {
    try {
      const productos = await ProductoFacade.listar();
      return res.status(200).json({ success: true, data: productos });
    } catch (err) {
      console.error('Error al listar productos:', err);
      return res.status(500).json({ message: 'Error interno al listar productos.' });
    }
  }
};

module.exports = ProductoController;
