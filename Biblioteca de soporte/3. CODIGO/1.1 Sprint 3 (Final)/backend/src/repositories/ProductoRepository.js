/**
 * Repositorio de clientes.
 * Gestiona el acceso y las operaciones sobre la tabla 'clientes' en la base de datos.
 */

const pool = require('../config/db');

const ProductoRepository = {
  async crearProducto(producto) {
    const {
      nombre,
      codigo,
      descripcion,
      precio,
      stock,
      categoria,
      proveedor,
      fecha_caducidad
    } = producto;

    const [result] = await pool.query(
      `INSERT INTO productos 
      (nombre, codigo, descripcion, precio, stock, categoria, proveedor, fecha_caducidad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        codigo,
        descripcion,
        precio,
        stock,
        categoria,
        proveedor,
        fecha_caducidad || null
      ]
    );

    return result.insertId;
  },

  async buscarPorCodigo(codigo) {
    const [rows] = await pool.query(
      `SELECT * FROM productos WHERE codigo = ?`,
      [codigo]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT * FROM productos WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  async listarTodos() {
    const [rows] = await pool.query(`SELECT * FROM productos ORDER BY creado_en DESC`);
    return rows;
  },

  async buscarProductos(criterios) {
    const { nombre, id, precioMin, precioMax } = criterios;
    let query = `SELECT * FROM productos WHERE 1=1`;
    let params = [];

    if (nombre && nombre.trim()) {
      query += ` AND nombre LIKE ?`;
      params.push(`%${nombre.trim()}%`);
    }

    if (id && !isNaN(id)) {
      query += ` AND id = ?`;
      params.push(parseInt(id));
    }

    if (precioMin !== undefined && precioMin !== null && !isNaN(precioMin)) {
      query += ` AND precio >= ?`;
      params.push(parseFloat(precioMin));
    }

    if (precioMax !== undefined && precioMax !== null && !isNaN(precioMax)) {
      query += ` AND precio <= ?`;
      params.push(parseFloat(precioMax));
    }

    query += ` ORDER BY nombre ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Actualizar producto (sin actualizado_en)
  async actualizarProducto(id, producto) {
    const {
      nombre,
      codigo,
      descripcion,
      precio,
      stock,
      categoria,
      proveedor,
      fecha_caducidad
    } = producto;

    const [result] = await pool.query(
      `UPDATE productos 
       SET nombre = ?, codigo = ?, descripcion = ?, precio = ?, stock = ?, 
           categoria = ?, proveedor = ?, fecha_caducidad = ?
       WHERE id = ?`,
      [
        nombre,
        codigo,
        descripcion,
        precio,
        stock,
        categoria,
        proveedor,
        fecha_caducidad || null,
        id
      ]
    );

    return result.affectedRows > 0;
  },

  async eliminarProducto(id) {
    const [result] = await pool.query(
      `DELETE FROM productos WHERE id = ?`,
      [id]
    );

    return result.affectedRows > 0;
  },

  async tieneTransaccionesPendientes(id) {
    return false;
  },

  async buscarPorCodigoExceptoId(codigo, id) {
    const [rows] = await pool.query(
      `SELECT * FROM productos WHERE codigo = ? AND id != ?`,
      [codigo, id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

};

module.exports = ProductoRepository;