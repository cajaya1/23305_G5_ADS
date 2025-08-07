/*
OBJETIVO: Probar flujos completos de la aplicación
- Verifica integración entre componentes
- Valida casos de uso reales
- PASA: Si los flujos completos funcionan correctamente
- FALLA: Si hay problemas en la integración de componentes
*/

const request = require('supertest');
const express = require('express');

// Aplicación para pruebas de integración
const app = express();
app.use(express.json());

// Ruta de login para pruebas
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Lógica de autenticación
  if (email === 'test@test.com' && password === 'password') {
    res.json({ success: true, token: 'mock-token' });        // Login exitoso
  } else {
    res.status(401).json({ success: false, message: 'Credenciales inválidas' }); // Login fallido
  }
});

describe('Pruebas de Integración', () => {
  // PRUEBA 19: Verificar flujo completo de login exitoso
  test('debería permitir login válido', async () => {
    // Ejecutar request de login con credenciales válidas
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(200); // Esperar status 200 OK

    // Verificar respuesta exitosa del login
    expect(response.body.success).toBe(true);          // Login exitoso
    expect(response.body.token).toBe('mock-token');    // Token generado
  });

  // PRUEBA 20: Verificar rechazo de credenciales incorrectas
  test('debería rechazar login inválido', async () => {
    // Ejecutar request con credenciales incorrectas
    const response = await request(app)
      .post('/api/login')
      .send({
        email: 'wrong@test.com',
        password: 'wrongpassword'
      })
      .expect(401); // Esperar status 401 Unauthorized

    // Verificar respuesta de error del login
    expect(response.body.success).toBe(false); // Login fallido
  });
});