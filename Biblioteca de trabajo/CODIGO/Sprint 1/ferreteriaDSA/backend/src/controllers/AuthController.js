const AuthFacade = require('../facades/AuthFacade');

const AuthController = {
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'El email y la contraseña son obligatorios.'
      });
    }

    try {
      const result = await AuthFacade.login(email, password);

      return res.status(result.status).json({
        message: result.message,
        ...(result.success ? { data: result.data } : { errorType: result.errorType })
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }
  }
};

module.exports = AuthController;
