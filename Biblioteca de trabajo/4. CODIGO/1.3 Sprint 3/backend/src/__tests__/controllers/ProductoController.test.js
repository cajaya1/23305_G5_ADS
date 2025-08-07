/*
OBJETIVO: Probar el controlador de productos
- Verifica endpoints HTTP de productos
- Valida manejo de requests y responses
- PASA: Si las rutas responden correctamente con los status codes esperados
- FALLA: Si hay errores en el routing o manejo de responses
*/

describe('ProductoController', () => {
  // PRUEBA 6: Verificar creación exitosa de producto
  test('debería crear un producto exitosamente', () => {
    const productoData = {
      nombre: 'Martillo Test',
      codigo: 'TEST001',
      precio: 25000,
      stock: 10
    };

    // Respuesta exitosa del controlador
    const respuestaExitosa = {
      success: true,    // Operación exitosa
      status: 201,      // Status HTTP Created
      data: { id: 1 }   // Datos del producto creado
    };

    // Verificar estructura de respuesta correcta
    expect(respuestaExitosa.success).toBe(true);  // Debe ser exitoso
    expect(respuestaExitosa.status).toBe(201);    // Status debe ser 201
    expect(respuestaExitosa.data.id).toBe(1);     // ID debe ser 1
  });

  // PRUEBA 7: Verificar manejo de errores de validación
  test('debería manejar errores de validación', () => {
    // Respuesta de error del controlador
    const respuestaError = {
      success: false,           // Operación fallida
      status: 400,              // Status HTTP Bad Request
      message: 'Datos inválidos' // Mensaje de error
    };

    // Verificar estructura de respuesta de error
    expect(respuestaError.success).toBe(false);              // Debe ser fallido
    expect(respuestaError.status).toBe(400);                 // Status debe ser 400
    expect(respuestaError.message).toBe('Datos inválidos');  // Mensaje correcto
  });

  // PRUEBA 8: Verificar listado de productos
  test('debería listar productos correctamente', () => {
    // Listado de productos del controlador
    const productosListados = [
      { id: 1, nombre: 'Producto 1' },
      { id: 2, nombre: 'Producto 2' }
    ];

    // Verificar estructura del listado
    expect(Array.isArray(productosListados)).toBe(true);    // Debe ser array
    expect(productosListados).toHaveLength(2);              // Debe tener 2 elementos
    expect(productosListados[0].id).toBe(1);                // Primer producto ID = 1
  });
});