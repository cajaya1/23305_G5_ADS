const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const Usuario = require('../models/Usuario');

const AuthService = {
  async login(email, password) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (rows.length === 0) {
      return {
        success: false,
        status: 404,
        message: 'El usuario no existe.',
        errorType: 'usuario'
      };
    }

    const userData = rows[0];
    const usuario = new Usuario(userData);
    const validPassword = await bcrypt.compare(password, usuario.password);

    if (!validPassword) {
      return {
        success: false,
        status: 401,
        message: 'Contraseña incorrecta.',
        errorType: 'credenciales'
      };
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return {
      success: true,
      status: 200,
      message: `Accedió como ${usuario.rol === 'admin' ? 'administrador' : 'usuario'}`,
      data: {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          rol: usuario.rol
        }
      }
    };
  }
};

module.exports = AuthService;
