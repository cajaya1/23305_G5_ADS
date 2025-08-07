/**
 * Modelo de Venta.
 * Representa la entidad venta, sus propiedades principales y métodos de utilidad.
 */

class Venta {
  constructor(venta) {
    this.id = venta.id;
    this.numero_factura = venta.numero_factura;
    this.cliente_id = venta.cliente_id;
    this.cliente_nombre = venta.cliente_nombre;
    this.cliente_cedula = venta.cliente_cedula;
    this.cliente_direccion = venta.cliente_direccion;
    this.cliente_telefono = venta.cliente_telefono;
    this.cliente_email = venta.cliente_email;
    this.subtotal = parseFloat(venta.subtotal) || 0;
    this.descuento = parseFloat(venta.descuento) || 0;
    this.impuesto = parseFloat(venta.impuesto) || 0;
    this.total = parseFloat(venta.total) || 0;
    this.metodo_pago = venta.metodo_pago;
    this.estado = venta.estado;
    this.vendedor_id = venta.vendedor_id;
    this.notas = venta.notas;
    this.detalles = venta.detalles || [];
    this.creado_en = venta.creado_en;
    
  }

  // Validar datos de venta
  validar() {
    const errores = [];

    if (!this.cliente_nombre || this.cliente_nombre.trim().length === 0) {
      errores.push('El nombre del cliente es requerido.');
    }

    if (!this.subtotal || this.subtotal <= 0) {
      errores.push('El subtotal debe ser mayor a 0.');
    }

    if (!this.total || this.total <= 0) {
      errores.push('El total debe ser mayor a 0.');
    }

    if (!this.detalles || this.detalles.length === 0) {
      errores.push('La venta debe tener al menos un producto.');
    }

    return errores;
  }

  // Calcular totales
  calcularTotales() {
    this.subtotal = this.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
    this.impuesto = this.subtotal * 0.19; // IVA 19%
    this.total = this.subtotal + this.impuesto - this.descuento;
  }

  // Generar número de factura
  static generarNumeroFactura() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    
    return `FAC-${año}${mes}${dia}-${timestamp}`;
  }
}

module.exports = Venta;