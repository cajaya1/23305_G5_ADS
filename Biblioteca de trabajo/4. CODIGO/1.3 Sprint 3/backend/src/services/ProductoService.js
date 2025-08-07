/**
 * Servicio de productos.
 * Gestiona la lógica de negocio relacionada con productos y utiliza el repositorio para acceder a los datos.
 */

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
  },

  async buscar(criterios) {
    try {
      const { nombre, id, precioMin, precioMax } = criterios;
      
      if (!nombre && !id && precioMin === undefined && precioMax === undefined) {
        return {
          success: false,
          status: 400,
          message: 'Debe proporcionar al menos un criterio de búsqueda.'
        };
      }

      if (precioMin !== undefined && precioMax !== undefined) {
        if (parseFloat(precioMin) > parseFloat(precioMax)) {
          return {
            success: false,
            status: 400,
            message: 'El precio mínimo no puede ser mayor al precio máximo.'
          };
        }
      }

      const productos = await ProductoRepository.buscarProductos(criterios);
      
      if (productos.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'No se encontraron productos que coincidan con los criterios de búsqueda.'
        };
      }

      return {
        success: true,
        status: 200,
        message: `Se encontraron ${productos.length} producto(s) que coinciden con la búsqueda.`,
        data: productos.map(p => new Producto(p))
      };

    } catch (error) {
      console.error('Error en ProductoService.buscar:', error);
      return {
        success: false,
        status: 500,
        message: 'Error interno al buscar productos. No se pudo acceder a la base de datos.'
      };
    }
  },

  // NUEVO: Actualizar producto
  async actualizar(id, productoData) {
    try {
      // Validar que el producto existe
      const productoExistente = await ProductoRepository.buscarPorId(id);
      if (!productoExistente) {
        return {
          success: false,
          status: 404,
          message: 'Producto no encontrado.'
        };
      }

      // Validar campos obligatorios
      const { nombre, codigo, precio, stock } = productoData;

      if (!nombre || !codigo || precio === undefined || stock === undefined) {
        return {
          success: false,
          status: 400,
          message: 'Faltan campos obligatorios para la actualización.'
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

      // Verificar que el código no esté en uso por otro producto
      const codigoExistente = await ProductoRepository.buscarPorCodigoExceptoId(codigo, id);
      if (codigoExistente) {
        return {
          success: false,
          status: 409,
          message: 'Ya existe otro producto con ese código.'
        };
      }

      // Actualizar producto
      const actualizado = await ProductoRepository.actualizarProducto(id, productoData);
      
      if (!actualizado) {
        return {
          success: false,
          status: 500,
          message: 'Error al actualizar el producto en la base de datos.'
        };
      }

      // Obtener producto actualizado
      const productoActualizado = await ProductoRepository.buscarPorId(id);

      return {
        success: true,
        status: 200,
        message: 'Producto actualizado exitosamente.',
        data: new Producto(productoActualizado)
      };

    } catch (error) {
      console.error('Error en ProductoService.actualizar:', error);
      return {
        success: false,
        status: 500,
        message: 'Error interno al actualizar el producto. No se pudo acceder a la base de datos.'
      };
    }
  },

  // NUEVO: Eliminar producto
  async eliminar(id) {
    try {
      // Validar que el producto existe
      const productoExistente = await ProductoRepository.buscarPorId(id);
      if (!productoExistente) {
        return {
          success: false,
          status: 404,
          message: 'Producto no encontrado.'
        };
      }

      // Verificar si tiene transacciones pendientes
      const tieneTransacciones = await ProductoRepository.tieneTransaccionesPendientes(id);
      if (tieneTransacciones) {
        return {
          success: false,
          status: 409,
          message: 'No se puede eliminar el producto porque tiene transacciones pendientes asociadas.'
        };
      }

      // Eliminar producto
      const eliminado = await ProductoRepository.eliminarProducto(id);
      
      if (!eliminado) {
        return {
          success: false,
          status: 500,
          message: 'Error al eliminar el producto de la base de datos.'
        };
      }

      return {
        success: true,
        status: 200,
        message: `Producto "${productoExistente.nombre}" eliminado exitosamente.`,
        data: {
          id: id,
          nombre: productoExistente.nombre,
          codigo: productoExistente.codigo,
          eliminado_en: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error en ProductoService.eliminar:', error);
      return {
        success: false,
        status: 500,
        message: 'Error interno al eliminar el producto. No se pudo acceder a la base de datos.'
      };
    }
  },

  async verificarStock(identificador) {
    try {
      let producto = null;
      
      // Verificar si es un ID numérico
      if (!isNaN(identificador)) {
        producto = await ProductoRepository.verificarStockPorId(parseInt(identificador));
      } else {
        // Buscar por código
        producto = await ProductoRepository.verificarStockPorCodigo(identificador);
      }

      if (!producto) {
        return {
          success: false,
          status: 404,
          message: 'Producto no encontrado en el inventario.'
        };
      }

      // Clasificar el nivel de stock
      let nivelStock = 'adecuado';
      let mensaje = 'Stock en nivel adecuado';
      let severity = 'success';

      if (producto.stock === 0) {
        nivelStock = 'critico';
        mensaje = '¡CRÍTICO! El producto está agotado';
        severity = 'error';
      } else if (producto.stock <= 10) {
        nivelStock = 'bajo';
        mensaje = '¡ADVERTENCIA! Stock bajo, considere reabastecer';
        severity = 'warn';
      } else if (producto.stock <= 50) {
        nivelStock = 'medio';
        mensaje = 'Stock en nivel medio';
        severity = 'info';
      }

      return {
        success: true,
        status: 200,
        message: 'Stock verificado exitosamente',
        data: {
          producto: new Producto(producto),
          nivelStock,
          mensaje,
          severity,
          stockActual: producto.stock
        }
      };

    } catch (error) {
      console.error('Error en ProductoService.verificarStock:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al verificar el stock. No se pudo acceder a la base de datos.'
      };
    }
  },

  // NUEVO: Obtener resumen del inventario
  async obtenerResumenInventario() {
    try {
      const resumen = await ProductoRepository.obtenerResumenStock();
      const productosStockBajo = await ProductoRepository.obtenerProductosStockBajo(10);

      return {
        success: true,
        status: 200,
        message: 'Resumen de inventario obtenido exitosamente',
        data: {
          resumen,
          productosStockBajo: productosStockBajo.map(p => new Producto(p))
        }
      };

    } catch (error) {
      console.error('Error en ProductoService.obtenerResumenInventario:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al obtener resumen del inventario. No se pudo acceder a la base de datos.'
      };
    }
  },

  // NUEVO: Actualizar stock manualmente
  async actualizarStock(id, nuevoStock) {
    try {
      // Validar que el producto existe
      const producto = await ProductoRepository.buscarPorId(id);
      if (!producto) {
        return {
          success: false,
          status: 404,
          message: 'Producto no encontrado.'
        };
      }

      // Validar nuevo stock
      if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
        return {
          success: false,
          status: 400,
          message: 'El stock debe ser un número entero positivo.'
        };
      }

      // Actualizar stock
      const actualizado = await ProductoRepository.actualizarSoloStock(id, nuevoStock);
      
      if (!actualizado) {
        return {
          success: false,
          status: 500,
          message: 'Error al actualizar el stock en la base de datos.'
        };
      }

      return {
        success: true,
        status: 200,
        message: `Stock actualizado exitosamente. Nuevo stock: ${nuevoStock} unidades.`,
        data: {
          id: id,
          nombreProducto: producto.nombre,
          stockAnterior: producto.stock,
          stockNuevo: nuevoStock
        }
      };

    } catch (error) {
      console.error('Error en ProductoService.actualizarStock:', error);
      return {
        success: false,
        status: 500,
        message: 'Error interno al actualizar el stock. No se pudo acceder a la base de datos.'
      };
    }
  }

};

module.exports = ProductoService;