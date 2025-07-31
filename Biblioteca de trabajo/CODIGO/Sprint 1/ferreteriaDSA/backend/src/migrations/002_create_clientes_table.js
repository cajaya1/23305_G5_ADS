const pool = require('../config/db');

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombres VARCHAR(100) NOT NULL,
      apellidos VARCHAR(100) NOT NULL,
      cedula VARCHAR(10) NOT NULL UNIQUE,
      direccion VARCHAR(255),
      telefono VARCHAR(20),
      email VARCHAR(100),
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Tabla 'clientes' creada correctamente.");
}

module.exports = { run };
