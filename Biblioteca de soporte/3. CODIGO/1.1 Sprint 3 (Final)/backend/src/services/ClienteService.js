/**
 * Servicio de autenticación.
 * Gestiona la lógica de login, validación de usuario y generación de token JWT.
 */

const ClienteRepository = require('../repositories/ClienteRepository');
const Cliente = require('../models/Cliente');

const ClienteService = {
  async registrar(clienteData) {
    const existente = await ClienteRepository.buscarPorCedula(clienteData.cedula);
    if (existente) {
      return {
        success: false,
        message: 'El cliente ya está registrado.',
        status: 400
      };
    }

    const id = await ClienteRepository.crearCliente(clienteData);
    return {
      success: true,
      message: 'Cliente registrado correctamente.',
      status: 201,
      data: { id }
    };
  },

  async buscar(cedula) {
    const cliente = await ClienteRepository.buscarPorCedula(cedula);
    if (!cliente) {
      return {
        success: false,
        message: 'Cliente no encontrado.',
        status: 404
      };
    }

    return {
      success: true,
      status: 200,
      data: new Cliente(cliente)
    };
  },

  async listar(filtro = '') {
    const clientes = await ClienteRepository.buscarTodos(filtro);
    return clientes.map(c => new Cliente(c));
  },

  async actualizar(id, datos) {
    const actualizado = await ClienteRepository.actualizarCliente(id, datos);
    if (!actualizado) {
      return {
        success: false,
        message: 'No se pudo actualizar el cliente.',
        status: 404
      };
    }

    return {
      success: true,
      message: 'Cliente actualizado exitosamente.',
      status: 200
    };
  },

  async eliminar(id) {
    const eliminado = await ClienteRepository.eliminarCliente(id);
    if (!eliminado) {
      return {
        success: false,
        message: 'Cliente no encontrado o ya eliminado.',
        status: 404
      };
    }

    return {
      success: true,
      message: 'Cliente eliminado correctamente.',
      status: 200
    };
  },

  async listarFrecuentes() {
    const clientes = await ClienteRepository.listarFrecuentes();
    return clientes.map(c => new Cliente(c));
  },

  async marcarFrecuente(id) {
    await ClienteRepository.marcarFrecuente(id);
  }
};

module.exports = ClienteService;
