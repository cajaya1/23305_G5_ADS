const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migraciones_aplicadas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      ejecutada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const folder = path.join(__dirname);
  const archivos = fs.readdirSync(folder)
    .filter(f => f.endsWith('.js') && f !== 'runMigrations.js');

  const [aplicadas] = await pool.query('SELECT nombre FROM migraciones_aplicadas');
  const yaEjecutadas = aplicadas.map(m => m.nombre);

  for (const archivo of archivos.sort()) {
    if (yaEjecutadas.includes(archivo)) {
      continue;
    }

    const migracion = require(path.join(folder, archivo));
    try {
      await migracion.run();
      await pool.query('INSERT INTO migraciones_aplicadas (nombre) VALUES (?)', [archivo]);
    } catch (err) {
      console.error(`Error al ejecutar la migración ${archivo}:`, err);
      throw err;
    }
  }
}

module.exports = runMigrations;
