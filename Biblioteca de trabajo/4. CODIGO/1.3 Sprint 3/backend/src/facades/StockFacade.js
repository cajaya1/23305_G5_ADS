/**
 * Fachada de stock.
 * Orquesta la lógica de inventario y delega las operaciones al servicio correspondiente.
 */

const StockService = require('../services/StockService');

const StockFacade = {
  // Verificar stock de un producto
  verificarStock: async (identificador) => {
    return await StockService.verificarStock(identificador);
  },

  // Obtener resumen completo del inventario
  obtenerResumenInventario: async () => {
    return await StockService.obtenerResumenInventario();
  },

  // Actualizar stock manualmente
  actualizarStock: async (id, nuevoStock) => {
    return await StockService.actualizarStock(id, nuevoStock);
  },

  // Incrementar stock
  incrementarStock: async (id, cantidad) => {
    return await StockService.incrementarStock(id, cantidad);
  },

  // Decrementar stock
  decrementarStock: async (id, cantidad) => {
    return await StockService.decrementarStock(id, cantidad);
  },

  // Obtener productos por nivel de stock
  obtenerProductosPorNivel: async (nivelStock) => {
    return await StockService.obtenerProductosPorNivel(nivelStock);
  }
};

module.exports = StockFacade;