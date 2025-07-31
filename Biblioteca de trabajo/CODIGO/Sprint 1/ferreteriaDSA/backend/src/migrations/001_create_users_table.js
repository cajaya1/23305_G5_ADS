const pool = require('../config/db');

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      rol ENUM('admin', 'vendedor') NOT NULL DEFAULT 'vendedor',
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Tabla 'usuarios' creada correctamente.");
}

module.exports = { run };
