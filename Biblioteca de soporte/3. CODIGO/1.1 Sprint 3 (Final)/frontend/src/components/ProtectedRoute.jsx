import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const usuarioData = localStorage.getItem('usuario');
  
  if (!usuarioData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const usuario = JSON.parse(usuarioData);
    
    if (!usuario.rol) {
      return <Navigate to="/login" replace />;
    }

    // Si no se especifican roles permitidos, cualquier usuario autenticado puede acceder
    if (allowedRoles.length === 0) {
      return children;
    }

    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (allowedRoles.includes(usuario.rol)) {
      return children;
    }

    // Si no tiene permisos, redirigir a una página de acceso permitido
    const redirectPath = usuario.rol === 'vendedor' ? '/clientes' : '/';
    return <Navigate to={redirectPath} replace />;
    
  } catch (error) {
    console.error('Error al parsear datos del usuario:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;