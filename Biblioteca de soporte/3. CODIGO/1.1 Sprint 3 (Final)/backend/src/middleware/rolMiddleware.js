/**
 * Middleware para verificar roles de usuario
 */

const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      // Obtener el usuario del token (asumiendo que tienes middleware de autenticación)
      const usuario = req.usuario; // Esto vendría del middleware de autenticación
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!usuario.rol) {
        return res.status(403).json({
          success: false,
          message: 'Usuario sin rol asignado'
        });
      }

      // Verificar si el rol del usuario está en los roles permitidos (SIN toLowerCase)
      if (!rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este recurso'
        });
      }

      next();
    } catch (error) {
      console.error('Error en verificación de rol:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

module.exports = { verificarRol };