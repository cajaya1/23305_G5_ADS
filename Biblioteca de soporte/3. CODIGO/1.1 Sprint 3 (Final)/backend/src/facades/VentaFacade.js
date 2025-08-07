/**
 * Fachada de ventas.
 * Orquesta la lógica de ventas y delega las operaciones al servicio correspondiente.
 */

const VentaService = require('../services/VentaService');

const VentaFacade = {
  // Procesar una nueva venta
  procesarVenta: async (ventaData) => {
    return await VentaService.procesarVenta(ventaData);
  },

  // Obtener venta por ID
  obtenerVentaPorId: async (id) => {
    return await VentaService.obtenerVentaPorId(id);
  },

  // Obtener venta por número de factura
  obtenerVentaPorFactura: async (numeroFactura) => {
    return await VentaService.obtenerVentaPorFactura(numeroFactura);
  },

  // Listar ventas con filtros
  listarVentas: async (filtros) => {
    return await VentaService.listarVentas(filtros);
  },

  // Obtener estadísticas de ventas
  obtenerEstadisticas: async (filtros) => {
    return await VentaService.obtenerEstadisticas(filtros);
  },

  // Cancelar venta
  cancelarVenta: async (id) => {
    return await VentaService.cancelarVenta(id);
  },

  // Registrar cliente rápido
  registrarClienteRapido: async (clienteData) => {
    return await VentaService.registrarClienteRapido(clienteData);
  }
};

module.exports = VentaFacade;