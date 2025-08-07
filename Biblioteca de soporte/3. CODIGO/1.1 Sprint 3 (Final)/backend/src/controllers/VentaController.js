/**
 * Controlador de ventas.
 * Gestiona las peticiones HTTP relacionadas con ventas y delega la lógica a la fachada de ventas.
 * Incluye generación de PDF de facturas.
 */

const VentaFacade = require('../facades/VentaFacade');
const PDFDocument = require('pdfkit');

const VentaController = {
  // Procesar nueva venta
  async procesarVenta(req, res) {
    try {
      const resultado = await VentaFacade.procesarVenta(req.body);
      return res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Error al procesar venta:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al procesar la venta'
      });
    }
  },

  // Obtener venta por ID
  async obtenerVentaPorId(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de venta inválido'
        });
      }

      const resultado = await VentaFacade.obtenerVentaPorId(id);
      return res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Error al obtener venta:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener la venta'
      });
    }
  },

  // Obtener venta por número de factura
  async obtenerVentaPorFactura(req, res) {
    try {
      const numeroFactura = req.params.numeroFactura;
      
      if (!numeroFactura) {
        return res.status(400).json({
          success: false,
          message: 'Número de factura es requerido'
        });
      }

      const resultado = await VentaFacade.obtenerVentaPorFactura(numeroFactura);
      return res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Error al obtener factura:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener la factura'
      });
    }
  },

  // Listar ventas
  async listarVentas(req, res) {
    try {
      const filtros = {
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
        cliente_nombre: req.query.cliente_nombre,
        vendedor_id: req.query.vendedor_id,
        estado: req.query.estado,
        limite: req.query.limite || 50,
        offset: req.query.offset || 0
      };

      const resultado = await VentaFacade.listarVentas(filtros);
      return res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Error al listar ventas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al listar las ventas'
      });
    }
  },

  // Obtener estadísticas
  async obtenerEstadisticas(req, res) {
    try {
      const filtros = {
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const resultado = await VentaFacade.obtenerEstadisticas(filtros);
      return res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al obtener estadísticas'
      });
    }
  },

  // Cancelar venta
  async cancelarVenta(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de venta inválido'
        });
      }

      const resultado = await VentaFacade.cancelarVenta(id);
      return res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al cancelar la venta'
      });
    }
  },

  // Registrar cliente rápido
  async registrarClienteRapido(req, res) {
    try {
      const resultado = await VentaFacade.registrarClienteRapido(req.body);
      return res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Error al registrar cliente rápido:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al registrar el cliente'
      });
    }
  },

  // Generar PDF de factura
  async generarPDF(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID de venta inválido'
        });
      }

      const resultado = await VentaFacade.obtenerVentaPorId(id);
      
      if (!resultado.success) {
        return res.status(resultado.status).json(resultado);
      }

      const venta = resultado.data;

      // Crear documento PDF
      const doc = new PDFDocument({ margin: 50 });
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="factura-${venta.numero_factura}.pdf"`);
      
      // Pipe el PDF a la respuesta
      doc.pipe(res);

      // Header de la empresa
      doc.fontSize(20).font('Helvetica-Bold')
         .text('FERRETERÍA DSA', 50, 50);
      
      doc.fontSize(12).font('Helvetica')
         .text('NIT: 123.456.789-0', 50, 75)
         .text('Dirección: Calle 123 #45-67, Bogotá', 50, 90)
         .text('Teléfono: (01) 234-5678', 50, 105)
         .text('Email: info@ferreteriaDSA.com', 50, 120);

      // Información de la factura
      doc.fontSize(16).font('Helvetica-Bold')
         .text('FACTURA DE VENTA', 400, 50);
      
      doc.fontSize(12).font('Helvetica')
         .text(`Número: ${venta.numero_factura}`, 400, 75)
         .text(`Fecha: ${new Date(venta.creado_en).toLocaleDateString()}`, 400, 90)
         .text(`Estado: ${venta.estado.toUpperCase()}`, 400, 105);

      // Línea separadora
      doc.moveTo(50, 150).lineTo(550, 150).stroke();

      // Datos del cliente
      doc.fontSize(14).font('Helvetica-Bold')
         .text('DATOS DEL CLIENTE', 50, 170);
      
      doc.fontSize(10).font('Helvetica')
         .text(`Nombre: ${venta.cliente_nombre}`, 50, 190)
         .text(`Cédula: ${venta.cliente_cedula || 'No especificada'}`, 50, 205)
         .text(`Dirección: ${venta.cliente_direccion || 'No especificada'}`, 50, 220)
         .text(`Teléfono: ${venta.cliente_telefono || 'No especificado'}`, 50, 235);

      // Tabla de productos
      let yPosition = 270;
      doc.fontSize(12).font('Helvetica-Bold')
         .text('DETALLE DE PRODUCTOS', 50, yPosition);

      yPosition += 20;
      
      // Headers de tabla
      doc.fontSize(10).font('Helvetica-Bold')
         .text('Código', 50, yPosition)
         .text('Producto', 120, yPosition)
         .text('Cant.', 350, yPosition)
         .text('P. Unit.', 400, yPosition)
         .text('Subtotal', 470, yPosition);

      yPosition += 15;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 10;

      // Detalles de productos
      doc.font('Helvetica');
      for (const detalle of venta.detalles) {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.text(detalle.producto_codigo, 50, yPosition)
           .text(detalle.producto_nombre.substring(0, 30), 120, yPosition)
           .text(detalle.cantidad.toString(), 350, yPosition)
           .text(`$${detalle.precio_unitario.toLocaleString()}`, 400, yPosition)
           .text(`$${detalle.subtotal.toLocaleString()}`, 470, yPosition);

        yPosition += 15;
      }

      // Línea separadora
      yPosition += 10;
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();

      // Totales
      yPosition += 20;
      doc.fontSize(10).font('Helvetica-Bold')
         .text('Subtotal:', 400, yPosition)
         .text(`$${venta.subtotal.toLocaleString()}`, 470, yPosition);

      yPosition += 15;
      doc.text('IVA (15%):', 400, yPosition)
         .text(`$${venta.impuesto.toLocaleString()}`, 470, yPosition);

      if (venta.descuento > 0) {
        yPosition += 15;
        doc.text('Descuento:', 400, yPosition)
           .text(`-$${venta.descuento.toLocaleString()}`, 470, yPosition);
      }

      yPosition += 15;
      doc.fontSize(12).font('Helvetica-Bold')
         .text('TOTAL:', 400, yPosition)
         .text(`$${venta.total.toLocaleString()}`, 470, yPosition);

      // Método de pago
      yPosition += 30;
      doc.fontSize(10).font('Helvetica')
         .text(`Método de pago: ${venta.metodo_pago.toUpperCase()}`, 50, yPosition);

      // Notas
      if (venta.notas) {
        yPosition += 30;
        doc.text('Notas:', 50, yPosition);
        yPosition += 15;
        doc.text(venta.notas, 50, yPosition);
      }

      // Footer
      yPosition += 50;
      doc.fontSize(8).font('Helvetica')
         .text('Gracias por su compra - Ferretería DSA', 50, yPosition, { align: 'center' });

      // Finalizar el documento
      doc.end();

    } catch (error) {
      console.error('Error al generar PDF:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno al generar el PDF'
      });
    }
  }
};

module.exports = VentaController;