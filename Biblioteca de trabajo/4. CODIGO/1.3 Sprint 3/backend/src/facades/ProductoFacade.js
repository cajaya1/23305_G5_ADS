/**
 * Fachada de productos.
 * Orquesta la lógica de productos y delega las operaciones al servicio correspondiente.
 */

const ProductoService = require('../services/ProductoService');

const ProductoFacade = {
  agregar: async (productoData) => {
    return await ProductoService.agregar(productoData);
  },

  listar: async () => {
    return await ProductoService.listar();
  },

  buscar: async (criterios) => {
    return await ProductoService.buscar(criterios);
  },

  // Facade para actualizar
  actualizar: async (id, productoData) => {
    return await ProductoService.actualizar(id, productoData);
  },

  // Facade para eliminar
  eliminar: async (id) => {
    return await ProductoService.eliminar(id);
  }
};

module.exports = ProductoFacade;