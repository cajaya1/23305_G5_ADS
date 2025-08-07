const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

async function crearUsuario(nombre, email, password, rol = 'vendedor') {
  try {
    const hash = await bcrypt.hash(password, 10);

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hash, rol]
    );

    console.log('Usuario creado con éxito. ID:', resultado.insertId);
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
  } finally {
    process.exit();
  }
}

// Puedes cambiar los valores aquí
const nombre = 'Josue Marin';
const email = 'admin@gmail.com';
const password = '2002123';
const rol = 'admin'; // o 'admin'

crearUsuario(nombre, email, password, rol);
