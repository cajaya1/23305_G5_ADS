/**
 * Servicio de stock.
 * Gestiona la lógica de negocio relacionada con el inventario y utiliza el repositorio para acceder a los datos.
 */

const StockRepository = require('../repositories/StockRepository');
const Producto = require('../models/Producto');

const StockService = {
  // Verificar stock de producto
  async verificarStock(identificador) {
    try {
      let producto = null;
      
      // Verificar si es un ID numérico
      if (!isNaN(identificador)) {
        producto = await StockRepository.verificarStockPorId(parseInt(identificador));
      } else {
        // Buscar por código
        producto = await StockRepository.verificarStockPorCodigo(identificador);
      }

      if (!producto) {
        return {
          success: false,
          status: 404,
          message: 'Producto no encontrado en el inventario.'
        };
      }

      // Clasificar el nivel de stock
      const clasificacion = StockService.clasificarNivelStock(producto.stock);

      return {
        success: true,
        status: 200,
        message: 'Stock verificado exitosamente',
        data: {
          producto: new Producto(producto),
          ...clasificacion,
          stockActual: producto.stock
        }
      };

    } catch (error) {
      console.error('Error en StockService.verificarStock:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al verificar el stock. No se pudo acceder a la base de datos.'
      };
    }
  },

  // Obtener resumen del inventario
  async obtenerResumenInventario() {
    try {
      const resumen = await StockRepository.obtenerResumenStock();
      const productosStockBajo = await StockRepository.obtenerProductosStockBajo(10);
      const alertas = await StockRepository.obtenerAlertasStock();
      const stockPorCategoria = await StockRepository.obtenerStockCriticoPorCategoria();

      return {
        success: true,
        status: 200,
        message: 'Resumen de inventario obtenido exitosamente',
        data: {
          resumen: {
            ...resumen,
            promedio_stock: parseFloat(resumen.promedio_stock || 0).toFixed(2)
          },
          productosStockBajo: productosStockBajo.map(p => new Producto(p)),
          alertas: alertas.map(alerta => ({
            ...alerta,
            clasificacion: StockService.clasificarNivelStock(alerta.stock)
          })),
          stockPorCategoria
        }
      };

    } catch (error) {
      console.error('Error en StockService.obtenerResumenInventario:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al obtener resumen del inventario. No se pudo acceder a la base de datos.'
      };
    }
  },

  // Actualizar stock manualmente
  async actualizarStock(id, nuevoStock) {
    try {
      // Validar que el producto existe
      const existeProducto = await StockRepository.existeProducto(id);
      if (!existeProducto) {
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

      // Obtener producto antes de actualizar
      const productoAnterior = await StockRepository.verificarStockPorId(id);
      
      // Actualizar stock
      const actualizado = await StockRepository.actualizarSoloStock(id, nuevoStock);
      
      if (!actualizado) {
        return {
          success: false,
          status: 500,
          message: 'Error al actualizar el stock en la base de datos.'
        };
      }

      // Clasificar el nuevo nivel de stock
      const clasificacion = StockService.clasificarNivelStock(nuevoStock);

      return {
        success: true,
        status: 200,
        message: `Stock actualizado exitosamente. ${clasificacion.mensaje}`,
        data: {
          id: id,
          nombreProducto: productoAnterior.nombre,
          stockAnterior: productoAnterior.stock,
          stockNuevo: nuevoStock,
          ...clasificacion
        }
      };

    } catch (error) {
      console.error('Error en StockService.actualizarStock:', error);
      return {
        success: false,
        status: 500,
        message: 'Error interno al actualizar el stock. No se pudo acceder a la base de datos.'
      };
    }
  },

  // Incrementar stock
  async incrementarStock(id, cantidad) {
    try {
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return {
          success: false,
          status: 400,
          message: 'La cantidad debe ser un número entero positivo.'
        };
      }

      const existeProducto = await StockRepository.existeProducto(id);
      if (!existeProducto) {
        return {
          success: false,
          status: 404,
          message: 'Producto no encontrado.'
        };
      }

      const actualizado = await StockRepository.incrementarStock(id, cantidad);
      
      if (!actualizado) {
        return {
          success: false,
          status: 500,
          message: 'Error al incrementar el stock.'
        };
      }

      // Obtener producto actualizado
      const productoActualizado = await StockRepository.verificarStockPorId(id);
      const clasificacion = StockService.clasificarNivelStock(productoActualizado.stock);

      return {
        success: true,
        status: 200,
        message: `Stock incrementado en ${cantidad} unidades. ${clasificacion.mensaje}`,
        data: {
          id: id,
          nombreProducto: productoActualizado.nombre,
          stockNuevo: productoActualizado.stock,
          cantidadIncremento: cantidad,
          ...clasificacion
        }
      };

    } catch (error) {
      console.error('Error en StockService.incrementarStock:', error);
      return {
        success: false,
        status: 500,
        message: 'Error interno al incrementar el stock.'
      };
    }
  },

  // Decrementar stock
  async decrementarStock(id, cantidad) {
    try {
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        return {
          success: false,
          status: 400,
          message: 'La cantidad debe ser un número entero positivo.'
        };
      }

      const existeProducto = await StockRepository.existeProducto(id);
      if (!existeProducto) {
        return {
          success: false,
          status: 404,
          message: 'Producto no encontrado.'
        };
      }

      const actualizado = await StockRepository.decrementarStock(id, cantidad);
      
      if (!actualizado) {
        return {
          success: false,
          status: 500,
          message: 'Error al decrementar el stock.'
        };
      }

      // Obtener producto actualizado
      const productoActualizado = await StockRepository.verificarStockPorId(id);
      const clasificacion = StockService.clasificarNivelStock(productoActualizado.stock);

      return {
        success: true,
        status: 200,
        message: `Stock decrementado en ${cantidad} unidades. ${clasificacion.mensaje}`,
        data: {
          id: id,
          nombreProducto: productoActualizado.nombre,
          stockNuevo: productoActualizado.stock,
          cantidadDecremento: cantidad,
          ...clasificacion
        }
      };

    } catch (error) {
      console.error('Error en StockService.decrementarStock:', error);
      return {
        success: false,
        status: 500,
        message: 'Error interno al decrementar el stock.'
      };
    }
  },

  // Obtener productos por nivel de stock
  async obtenerProductosPorNivel(nivelStock) {
    try {
      const nivelesPermitidos = ['critico', 'bajo', 'medio', 'alto'];
      
      if (!nivelesPermitidos.includes(nivelStock)) {
        return {
          success: false,
          status: 400,
          message: 'Nivel de stock inválido. Debe ser: critico, bajo, medio o alto.'
        };
      }

      const productos = await StockRepository.obtenerProductosPorNivelStock(nivelStock);

      return {
        success: true,
        status: 200,
        message: `Se encontraron ${productos.length} productos con stock ${nivelStock}`,
        data: productos.map(p => new Producto(p))
      };

    } catch (error) {
      console.error('Error en StockService.obtenerProductosPorNivel:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al obtener productos por nivel de stock.'
      };
    }
  },

  // Función helper para clasificar nivel de stock
  clasificarNivelStock(stock) {
    let nivelStock = 'adecuado';
    let mensaje = 'Stock en nivel adecuado';
    let severity = 'success';

    if (stock === 0) {
      nivelStock = 'critico';
      mensaje = '¡CRÍTICO! El producto está agotado';
      severity = 'error';
    } else if (stock <= 5) {
      nivelStock = 'critico';
      mensaje = '¡CRÍTICO! Stock muy bajo, reabastecer urgentemente';
      severity = 'error';
    } else if (stock <= 10) {
      nivelStock = 'bajo';
      mensaje = '¡ADVERTENCIA! Stock bajo, considere reabastecer';
      severity = 'warn';
    } else if (stock <= 50) {
      nivelStock = 'medio';
      mensaje = 'Stock en nivel medio';
      severity = 'info';
    } else {
      nivelStock = 'alto';
      mensaje = 'Stock en nivel alto';
      severity = 'success';
    }

    return {
      nivelStock,
      mensaje,
      severity
    };
  }
};

module.exports = StockService;