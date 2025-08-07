/**
 * Modelo de VentaDetalle.
 * Representa el detalle de un producto dentro de una venta.
 */

class VentaDetalle {
  constructor(detalle) {
    this.id = detalle.id;
    this.venta_id = detalle.venta_id;
    this.producto_id = detalle.producto_id;
    this.producto_nombre = detalle.producto_nombre;
    this.producto_codigo = detalle.producto_codigo;
    this.cantidad = parseInt(detalle.cantidad) || 0;
    this.precio_unitario = parseFloat(detalle.precio_unitario) || 0;
    this.subtotal = parseFloat(detalle.subtotal) || 0;
    this.creado_en = detalle.creado_en;
  }

  // Validar detalle de venta
  validar() {
    const errores = [];

    if (!this.producto_id) {
      errores.push('El ID del producto es requerido.');
    }

    if (!this.cantidad || this.cantidad <= 0) {
      errores.push('La cantidad debe ser mayor a 0.');
    }

    if (!this.precio_unitario || this.precio_unitario <= 0) {
      errores.push('El precio unitario debe ser mayor a 0.');
    }

    return errores;
  }

  // Calcular subtotal
  calcularSubtotal() {
    this.subtotal = this.cantidad * this.precio_unitario;
  }
}

module.exports = VentaDetalle;