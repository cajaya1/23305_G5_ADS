/*
OBJETIVO: Probar el modelo Producto
- Verifica la creación correcta de productos
- Valida el manejo de datos faltantes
- PASA: Si se asignan todas las propiedades correctamente
- FALLA: Si hay problemas con la estructura del objeto
*/

const Producto = require('../../models/Producto');

describe('Modelo Producto', () => {
  // PRUEBA 1: Verificar creación correcta del modelo Producto
  test('debería crear un producto correctamente', () => {
    // Datos completos de un producto para verificar asignación correcta
    const datosProducto = {
      id: 1,
      nombre: 'Martillo',
      codigo: 'MART001',
      precio: 25000,
      stock: 50
    };

    // Crear instancia del producto usando el constructor
    const producto = new Producto(datosProducto);

    // Verificar que cada propiedad se asigne correctamente
    expect(producto.id).toBe(1);           // ID debe ser 1
    expect(producto.nombre).toBe('Martillo'); // Nombre debe ser 'Martillo'
    expect(producto.precio).toBe(25000);   // Precio debe ser 25000
  });

  // PRUEBA 2: Verificar manejo de datos faltantes sin errores
  test('debería manejar datos faltantes', () => {
    // Crear producto con datos mínimos para probar robustez
    const producto = new Producto({ nombre: 'Test' });
    
    // Verificar que maneja datos undefined correctamente
    expect(producto.nombre).toBe('Test');  // Nombre asignado debe permanecer
    expect(producto.id).toBeUndefined();   // ID debe ser undefined sin errores
  });
});