/**
 * Servicio de ventas.
 * Gestiona la lógica de negocio relacionada con ventas y utiliza los repositorios para acceder a los datos.
 */

const VentaRepository = require('../repositories/VentaRepository');
const ProductoRepository = require('../repositories/ProductoRepository');
const ClienteRepository = require('../repositories/ClienteRepository');
const Venta = require('../models/Venta');
const VentaDetalle = require('../models/VentaDetalle');

const VentaService = {
  // Procesar una nueva venta
  async procesarVenta(ventaData) {
    try {
      // Validar datos básicos
      if (!ventaData.cliente_nombre || !ventaData.detalles || ventaData.detalles.length === 0) {
        return {
          success: false,
          status: 400,
          message: 'Faltan datos obligatorios para procesar la venta.'
        };
      }

      // Crear instancia de venta
      const venta = new Venta({
        numero_factura: Venta.generarNumeroFactura(),
        cliente_id: ventaData.cliente_id || null,
        cliente_nombre: ventaData.cliente_nombre,
        cliente_cedula: ventaData.cliente_cedula || null,
        cliente_direccion: ventaData.cliente_direccion || null,
        cliente_telefono: ventaData.cliente_telefono || null,
        cliente_email: ventaData.cliente_email || null,
        metodo_pago: ventaData.metodo_pago || 'efectivo',
        vendedor_id: ventaData.vendedor_id || null,
        notas: ventaData.notas || null,
        descuento: ventaData.descuento || 0,
        estado: 'completada',
        detalles: []
      });

      // Procesar detalles de venta
      for (const detalleData of ventaData.detalles) {
        // Obtener información del producto
        const producto = await ProductoRepository.buscarPorId(detalleData.producto_id);
        
        if (!producto) {
          return {
            success: false,
            status: 404,
            message: `Producto con ID ${detalleData.producto_id} no encontrado.`
          };
        }

        // Crear detalle de venta
        const detalle = new VentaDetalle({
          producto_id: producto.id,
          producto_nombre: producto.nombre,
          producto_codigo: producto.codigo,
          cantidad: detalleData.cantidad,
          precio_unitario: producto.precio
        });

        // Validar detalle
        const erroresDetalle = detalle.validar();
        if (erroresDetalle.length > 0) {
          return {
            success: false,
            status: 400,
            message: `Errores en producto ${producto.nombre}: ${erroresDetalle.join(', ')}`
          };
        }

        // Calcular subtotal
        detalle.calcularSubtotal();
        venta.detalles.push(detalle);
      }

      // Verificar stock disponible
      const productosInsuficientes = await VentaRepository.verificarStockDisponible(venta.detalles);
      if (productosInsuficientes.length > 0) {
        return {
          success: false,
          status: 400,
          message: 'Stock insuficiente para algunos productos',
          data: { productosInsuficientes }
        };
      }

      // Calcular totales
      venta.calcularTotales();

      // Validar venta
      const erroresVenta = venta.validar();
      if (erroresVenta.length > 0) {
        return {
          success: false,
          status: 400,
          message: `Errores en la venta: ${erroresVenta.join(', ')}`
        };
      }

      // Crear venta en base de datos
      const ventaId = await VentaRepository.crearVenta(venta);

      // Obtener venta completa
      const ventaCompleta = await VentaRepository.obtenerVentaPorId(ventaId);

      return {
        success: true,
        status: 201,
        message: 'Venta procesada exitosamente',
        data: new Venta(ventaCompleta)
      };

    } catch (error) {
      console.error('Error en VentaService.procesarVenta:', error);
      return {
        success: false,
        status: 500,
        message: 'Error interno al procesar la venta'
      };
    }
  },

  // Obtener venta por ID
  async obtenerVentaPorId(id) {
    try {
      const venta = await VentaRepository.obtenerVentaPorId(id);
      
      if (!venta) {
        return {
          success: false,
          status: 404,
          message: 'Venta no encontrada'
        };
      }

      return {
        success: true,
        status: 200,
        message: 'Venta encontrada',
        data: new Venta(venta)
      };

    } catch (error) {
      console.error('Error en VentaService.obtenerVentaPorId:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al obtener la venta'
      };
    }
  },

  // Obtener venta por número de factura
  async obtenerVentaPorFactura(numeroFactura) {
    try {
      const venta = await VentaRepository.obtenerVentaPorNumeroFactura(numeroFactura);
      
      if (!venta) {
        return {
          success: false,
          status: 404,
          message: 'Factura no encontrada'
        };
      }

      return {
        success: true,
        status: 200,
        message: 'Factura encontrada',
        data: new Venta(venta)
      };

    } catch (error) {
      console.error('Error en VentaService.obtenerVentaPorFactura:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al obtener la factura'
      };
    }
  },

  // Listar ventas con filtros
  async listarVentas(filtros = {}) {
    try {
      const ventas = await VentaRepository.listarVentas(filtros);
      
      return {
        success: true,
        status: 200,
        message: `Se encontraron ${ventas.length} ventas`,
        data: ventas.map(venta => new Venta(venta))
      };

    } catch (error) {
      console.error('Error en VentaService.listarVentas:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al listar las ventas'
      };
    }
  },

  // Obtener estadísticas de ventas
  async obtenerEstadisticas(filtros = {}) {
    try {
      const estadisticas = await VentaRepository.obtenerEstadisticasVentas(filtros);
      const productosVendidos = await VentaRepository.obtenerProductosMasVendidos(5);

      return {
        success: true,
        status: 200,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          ventas: estadisticas,
          productos_mas_vendidos: productosVendidos
        }
      };

    } catch (error) {
      console.error('Error en VentaService.obtenerEstadisticas:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al obtener estadísticas'
      };
    }
  },

  // Cancelar venta
  async cancelarVenta(id) {
    try {
      const ventaExistente = await VentaRepository.obtenerVentaPorId(id);
      
      if (!ventaExistente) {
        return {
          success: false,
          status: 404,
          message: 'Venta no encontrada'
        };
      }

      if (ventaExistente.estado === 'cancelada') {
        return {
          success: false,
          status: 400,
          message: 'La venta ya está cancelada'
        };
      }

      const cancelada = await VentaRepository.cancelarVenta(id);
      
      if (!cancelada) {
        return {
          success: false,
          status: 500,
          message: 'Error al cancelar la venta'
        };
      }

      return {
        success: true,
        status: 200,
        message: 'Venta cancelada exitosamente'
      };

    } catch (error) {
      console.error('Error en VentaService.cancelarVenta:', error);
      return {
        success: false,
        status: 500,
        message: 'Error interno al cancelar la venta'
      };
    }
  },

  // Registrar cliente rápido para venta
  async registrarClienteRapido(clienteData) {
    try {
      // Validar datos mínimos
      if (!clienteData.nombres || !clienteData.cedula) {
        return {
          success: false,
          status: 400,
          message: 'Nombre y cédula son requeridos'
        };
      }

      // Verificar si ya existe
      const clienteExistente = await ClienteRepository.buscarPorCedula(clienteData.cedula);
      if (clienteExistente) {
        return {
          success: true,
          status: 200,
          message: 'Cliente ya registrado',
          data: clienteExistente
        };
      }

      // Crear cliente
      const clienteId = await ClienteRepository.crearCliente({
        nombres: clienteData.nombres,
        apellidos: clienteData.apellidos || '',
        cedula: clienteData.cedula,
        direccion: clienteData.direccion || '',
        telefono: clienteData.telefono || '',
        email: clienteData.email || ''
      });

      const nuevoCliente = await ClienteRepository.buscarPorId(clienteId);

      return {
        success: true,
        status: 201,
        message: 'Cliente registrado exitosamente',
        data: nuevoCliente
      };

    } catch (error) {
      console.error('Error en VentaService.registrarClienteRapido:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al registrar el cliente'
      };
    }
  }
};

module.exports = VentaService;