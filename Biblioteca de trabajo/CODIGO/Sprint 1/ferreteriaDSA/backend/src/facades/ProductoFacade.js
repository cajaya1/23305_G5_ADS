const ProductoService = require('../services/ProductoService');

const ProductoFacade = {
  agregar: async (productoData) => {
    return await ProductoService.agregar(productoData);
  },

  listar: async () => {
    return await ProductoService.listar();
  }
};

module.exports = ProductoFacade;
