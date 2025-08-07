import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import {
  Menu,
  Users,
  Package,
  BarChart3,
  ShoppingCart,
  LogOut,
  X,
  HelpCircle
} from 'lucide-react';
import '../styles/menu.css';

const MenuLateral = ({ onLogout, visible, onToggle }) => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = React.useRef(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      try {
        setUsuario(JSON.parse(usuarioData));
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        cerrarSesion();
      }
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    onLogout();
    setConfirmLogout(false);
    
    if (toast.current) {
      toast.current.show({
        severity: 'success',
        summary: 'Sesión cerrada',
        detail: 'Has cerrado sesión exitosamente',
        life: 2000
      });
    }
    
    navigate('/login', { replace: true });
  };

  // Definir todas las opciones del menú con roles específicos
  const todasLasOpciones = [
    {
      path: '/clientes',
      icon: Users,
      label: 'Clientes',
      active: location.pathname === '/clientes',
      description: 'Gestionar clientes',
      roles: ['admin', 'vendedor']
    },
    {
      path: '/productos',
      icon: Package,
      label: 'Productos',
      active: location.pathname === '/productos',
      description: 'Gestionar inventario',
      roles: ['admin']
    },
    {
      path: '/verificar-stock',
      icon: BarChart3,
      label: 'Verificar Stock',
      active: location.pathname === '/verificar-stock',
      description: 'Verificar y gestionar stock',
      roles: ['admin']
    },
    {
      path: '/ventas',
      icon: ShoppingCart,
      label: 'Ventas',
      active: location.pathname === '/ventas',
      description: 'Procesar ventas y generar facturas',
      roles: ['admin', 'vendedor']
    }
  ];

  // Filtrar opciones del menú basado en el rol del usuario
  const menuItems = todasLasOpciones.filter(item => {
    if (!usuario || !usuario.rol) return false;
    return item.roles.includes(usuario.rol);
  });

  // Función para mostrar el rol de manera legible
  const mostrarRol = (rol) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      default:
        return rol;
    }
  };

  return (
    <>
      <Toast ref={toast} />
      
      <button 
        className="menu-toggle" 
        onClick={() => onToggle(!visible)}
        aria-label="Toggle menu"
      >
        {visible ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`menu-lateral ${visible ? 'visible' : 'hidden'}`}>
        <div className="menu-scrollable">
          <div className="drawer-header">
            <h2>Ferretería DSA</h2>
            <div className="usuario-info">
              <p className="bienvenida">¡Bienvenido!</p>
              <p className="usuario-nombre">
                {usuario?.nombre || 'Usuario'}
              </p>
              <p className="usuario-rol">
                {usuario?.rol && `(${mostrarRol(usuario.rol)})`}
              </p>
            </div>
          </div>

          <nav className="drawer-nav">
            <ul>
              {menuItems.map((item) => (
                <li key={item.path} className={item.active ? 'active' : ''}>
                  <Link 
                    to={item.path} 
                    className={item.active ? 'active' : ''}
                    title={item.description}
                  >
                    <item.icon size={18} />
                    <span className="menu-label">{item.label}</span>
                    {item.active && (
                      <span className="active-indicator">
                        <div className="active-dot"></div>
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="menu-info">
          </div>
        </div>

        <div className="drawer-footer">
          <button
            className="logout-btn"
            onClick={() => setConfirmLogout(true)}
            type="button"
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {visible && window.innerWidth <= 768 && (
        <div 
          className="menu-overlay" 
          onClick={() => onToggle(false)}
          aria-label="Cerrar menú" 
        />
      )}

      <Dialog
        header="Confirmar cierre de sesión"
        visible={confirmLogout}
        onHide={() => setConfirmLogout(false)}
        style={{ width: '400px', maxWidth: '90vw' }}
        modal
        footer={
          <div className="logout-dialog-footer">
            <Button
              label="Cancelar"
              text
              onClick={() => setConfirmLogout(false)}
              size="small"
            />
            <Button
              label="Cerrar sesión"
              severity="danger"
              onClick={cerrarSesion}
              size="small"
            />
          </div>
        }
      >
        <div className="logout-dialog-content">
          <HelpCircle size={32} style={{ color: '#f39c12' }} />
          <span>¿Estás seguro de que deseas cerrar sesión?</span>
        </div>
      </Dialog>
    </>
  );
};

export default MenuLateral;