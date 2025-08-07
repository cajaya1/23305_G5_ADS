const User = require('../models/User');

// Login sencillo para prototipo sin encriptación
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    return res.status(200).json({ message: 'Login exitoso', user });
  } catch (err) {
    return res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
};
