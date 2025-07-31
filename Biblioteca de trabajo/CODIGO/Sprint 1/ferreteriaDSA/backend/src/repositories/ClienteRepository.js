const pool = require('../config/db');

const ClienteRepository = {
  async crearCliente(cliente) {
    const { nombres, apellidos, cedula, direccion, telefono, email } = cliente;

    const [result] = await pool.query(
      `INSERT INTO clientes (nombres, apellidos, cedula, direccion, telefono, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos, cedula, direccion, telefono, email]
    );

    return result.insertId;
  },

  async buscarPorCedula(cedula) {
    const [rows] = await pool.query(`SELECT * FROM clientes WHERE cedula = ?`, [cedula]);
    return rows.length > 0 ? rows[0] : null;
  },

  async buscarTodos(filtro = '') {
    const [rows] = await pool.query(`
      SELECT * FROM clientes
      WHERE nombres LIKE ? OR cedula LIKE ?
    `, [`%${filtro}%`, `%${filtro}%`]);

    return rows;
  },

  async actualizarCliente(id, datos) {
    const { nombres, apellidos, cedula, direccion, telefono, email } = datos;

    const [result] = await pool.query(
      `UPDATE clientes
       SET nombres = ?, apellidos = ?, cedula = ?, direccion = ?, telefono = ?, email = ?
       WHERE id = ?`,
      [nombres, apellidos, cedula, direccion, telefono, email, id]
    );

    return result.affectedRows > 0;
  },

  async eliminarCliente(id) {
    const [result] = await pool.query(`DELETE FROM clientes WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  },

  async marcarFrecuente(id) {
    await pool.query(`UPDATE clientes SET es_frecuente = 1 WHERE id = ?`, [id]);
  },

  async listarFrecuentes() {
    const [rows] = await pool.query(`SELECT * FROM clientes WHERE es_frecuente = 1`);
    return rows;
  }
};

module.exports = ClienteRepository;
