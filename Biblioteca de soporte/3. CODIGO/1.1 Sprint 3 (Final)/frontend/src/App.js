import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ClientesPage from './pages/ClientesPage';
import ProductosPage from './pages/ProductosPage';
import VerificarStockPage from './pages/VerificarStockPage';
import VentasPage from './pages/VentasPage';
import MenuLateral from './components/MenuLateral';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');
    
    if (token && usuarioData) {
      try {
        const usuarioObj = JSON.parse(usuarioData);
        setUsuario(usuarioObj);
        setIsAuthenticated(true);
        
        // En desktop, mostrar menú por defecto
        if (window.innerWidth > 768) {
          setMenuVisible(true);
        }
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        handleLogout();
      }
    }
  }, []);

  const handleLogin = () => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      try {
        const usuarioObj = JSON.parse(usuarioData);
        setUsuario(usuarioObj);
      } catch (error) {
        console.error('Error al parsear usuario:', error);
      }
    }
    setIsAuthenticated(true);
    
    // En desktop, mostrar menú después del login
    if (window.innerWidth > 768) {
      setMenuVisible(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setIsAuthenticated(false);
    setUsuario(null);
    setMenuVisible(false);
  };

  const toggleMenu = (forceState = null) => {
    if (forceState !== null) {
      setMenuVisible(forceState);
    } else {
      setMenuVisible(!menuVisible);
    }
  };

  return (
    <div className={`app-container ${isAuthenticated && !isLoginPage ? 'with-menu' : 'without-menu'} ${isLoginPage ? 'login-mode' : ''}`}>
      {isAuthenticated && !isLoginPage && (
        <MenuLateral 
          visible={menuVisible} 
          onToggle={toggleMenu} 
          onLogout={handleLogout}
        />
      )}
      
      <main className={`main-content ${isLoginPage ? 'login-content' : ''}`}>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/clientes" replace /> : 
              <LoginPage onLogin={handleLogin} />
            } 
          />
          
          {/* Rutas que requieren autenticación */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/clientes" replace />
            </ProtectedRoute>
          } />
          
          {/* Clientes - Acceso para admin y vendedor */}
          <Route path="/clientes" element={
            <ProtectedRoute allowedRoles={['admin', 'vendedor']}>
              <ClientesPage />
            </ProtectedRoute>
          } />
          
          {/* Ventas - Acceso para admin y vendedor */}
          <Route path="/ventas" element={
            <ProtectedRoute allowedRoles={['admin', 'vendedor']}>
              <VentasPage />
            </ProtectedRoute>
          } />
          
          {/* Productos - Solo admin */}
          <Route path="/productos" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProductosPage />
            </ProtectedRoute>
          } />
          
          {/* Verificar Stock - Solo admin */}
          <Route path="/verificar-stock" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VerificarStockPage />
            </ProtectedRoute>
          } />
          
          {/* Ruta para acceso denegado */}
          <Route path="/acceso-denegado" element={
            <ProtectedRoute>
              <div className="p-4 text-center">
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos para acceder a esta sección.</p>
              </div>
            </ProtectedRoute>
          } />
          
          {/* Ruta por defecto */}
          <Route path="*" element={<Navigate to="/clientes" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;