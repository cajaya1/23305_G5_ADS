import React, { useState } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password
      });

      const { token, usuario } = response.data.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // Actualizar el estado en App.js
      onLogin(token);

      // Navegar a clientes
      navigate('/clientes', { replace: true });
    } catch (error) {
      if (error.response && error.response.data) {
        setMensaje(error.response.data.message || 'Error al iniciar sesión');
      } else {
        setMensaje('Error de conexión. Verifique su conexión a internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-container">
            <img 
              src="/logo192.png" 
              alt="Ferretería DSA" 
              className="logo-image"
              onError={(e) => {
                // Fallback si no encuentra la imagen
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="logo-fallback" style={{ display: 'none' }}>
              <div className="logo-icon">🏪</div>
            </div>
          </div>
          <h1>Ferretería DSA</h1>
          <h2>Sistema de Gestión</h2>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@correo.com"
              className="custom-input"
              required
              disabled={loading}
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="input-group password-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className="custom-input"
                autoComplete="current-password"
                required
                disabled={loading}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            label={loading ? 'Ingresando...' : 'Ingresar'}
            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            className="login-btn"
            disabled={loading || !email || !password}
            loading={loading}
          />
        </form>

        {mensaje && (
          <div className={`login-msg ${mensaje.includes('Bienvenido') ? 'success' : 'error'}`}>
            {mensaje}
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;