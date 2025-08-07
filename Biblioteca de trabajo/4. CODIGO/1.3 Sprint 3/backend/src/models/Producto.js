/**
 * Modelo de Producto.
 * Representa la entidad producto y sus propiedades principales.
 */

class Producto {
  constructor({ id, nombre, codigo, descripcion, precio, stock, categoria, proveedor, fecha_caducidad, creado_en }) {
    this.id = id;
    this.nombre = nombre;
    this.codigo = codigo;
    this.descripcion = descripcion;
    this.precio = precio;
    this.stock = stock;
    this.categoria = categoria;
    this.proveedor = proveedor;
    this.fecha_caducidad = fecha_caducidad;
    this.creado_en = creado_en;
  }
}

module.exports = Producto;
