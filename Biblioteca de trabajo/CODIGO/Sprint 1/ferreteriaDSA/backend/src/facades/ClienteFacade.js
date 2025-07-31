const ClienteService = require('../services/ClienteService');

const ClienteFacade = {
  registrar: async (clienteData) => {
    return await ClienteService.registrar(clienteData);
  },

  buscarPorCedula: async (cedula) => {
    return await ClienteService.buscar(cedula);
  },

  listar: async (filtro) => {
    return await ClienteService.listar(filtro);
  },

  actualizar: async (id, datos) => {
    return await ClienteService.actualizar(id, datos);
  },

  eliminar: async (id) => {
    return await ClienteService.eliminar(id);
  },

  listarFrecuentes: async () => {
    return await ClienteService.listarFrecuentes();
  },

  marcarFrecuente: async (id) => {
    return await ClienteService.marcarFrecuente(id);
  }
};

module.exports = ClienteFacade;
