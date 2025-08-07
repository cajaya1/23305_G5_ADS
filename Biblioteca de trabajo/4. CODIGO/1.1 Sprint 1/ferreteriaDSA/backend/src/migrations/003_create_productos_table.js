const pool = require('../config/db');

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      codigo VARCHAR(50) NOT NULL UNIQUE,
      descripcion TEXT,
      precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
      stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
      categoria VARCHAR(100),
      proveedor VARCHAR(100),
      fecha_caducidad DATE,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Tabla 'productos' creada correctamente.");
}

module.exports = { run };
