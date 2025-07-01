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

  async listarTodos() {
    const [rows] = await pool.query(`SELECT * FROM productos ORDER BY creado_en DESC`);
    return rows;
  }
};

module.exports = ProductoRepository;
