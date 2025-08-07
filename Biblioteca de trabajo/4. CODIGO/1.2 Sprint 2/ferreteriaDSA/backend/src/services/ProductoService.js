const ProductoRepository = require('../repositories/ProductoRepository');
const Producto = require('../models/Producto');

const ProductoService = {
  async agregar(productoData) {
    // Validar campos obligatorios
    const { nombre, codigo, precio, stock } = productoData;

    if (!nombre || !codigo || precio === undefined || stock === undefined) {
      return {
        success: false,
        status: 400,
        message: 'Faltan campos obligatorios.'
      };
    }

    if (isNaN(precio) || precio < 0) {
      return {
        success: false,
        status: 400,
        message: 'El precio debe ser un número positivo.'
      };
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return {
        success: false,
        status: 400,
        message: 'El stock debe ser un número entero positivo.'
      };
    }

    // Verificar duplicado por código
    const existente = await ProductoRepository.buscarPorCodigo(codigo);
    if (existente) {
      return {
        success: false,
        status: 409,
        message: 'Ya existe un producto con ese código.'
      };
    }

    const id = await ProductoRepository.crearProducto(productoData);
    return {
      success: true,
      status: 201,
      message: 'Producto agregado exitosamente.',
      data: { id }
    };
  },

  async listar() {
    const productos = await ProductoRepository.listarTodos();
    return productos.map(p => new Producto(p));
  }
};

module.exports = ProductoService;
