/*
OBJETIVO: Probar el repositorio de productos
- Verifica operaciones de base de datos
- Valida creación, búsqueda y listado de productos
- PASA: Si las operaciones de base de datos funcionan correctamente
- FALLA: Si hay problemas con las consultas SQL o parámetros
*/

const ProductoRepository = require('../../repositories/ProductoRepository');

// Pool de base de datos para conexiones
const mockPool = require('../../config/db');

describe('ProductoRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar mocks entre pruebas para evitar interferencias
  });

  // PRUEBA 3: Verificar creación de producto en base de datos
  test('debería crear un producto correctamente', async () => {
    // Datos del producto a crear en la base de datos
    const nuevoProducto = {
      nombre: 'Martillo Test',
      codigo: 'TEST001',
      precio: 25000,
      stock: 10
    };

    // Respuesta de la base de datos para INSERT exitoso
    mockPool.query.mockResolvedValue([{ insertId: 1 }]);

    // Ejecutar el método del repositorio que hace INSERT
    const resultado = await ProductoRepository.crearProducto(nuevoProducto);

    // Verificar que se llamó la consulta SQL INSERT correcta
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO productos'), // Query debe contener INSERT
      expect.any(Array) // Parámetros deben ser un array
    );
    // Verificar que retorna el ID del producto creado
    expect(resultado).toBe(1);
  });

  // PRUEBA 4: Verificar búsqueda exitosa de producto por ID
  test('debería buscar producto por ID', async () => {
    // Producto encontrado en la base de datos
    const productoEncontrado = { id: 1, nombre: 'Martillo' };
    mockPool.query.mockResolvedValue([[productoEncontrado]]); // Resultado de SELECT

    // Buscar producto por ID específico
    const resultado = await ProductoRepository.buscarPorId(1);

    // Verificar que retorna el producto encontrado
    expect(resultado).toEqual(productoEncontrado);
  });

  // PRUEBA 5: Verificar comportamiento cuando no se encuentra producto
  test('debería retornar null si no encuentra producto', async () => {
    // Búsqueda sin resultados (array vacío)
    mockPool.query.mockResolvedValue([[]]);

    // Buscar producto inexistente
    const resultado = await ProductoRepository.buscarPorId(999);

    // Verificar que retorna null cuando no hay resultados
    expect(resultado).toBeNull();
  });
});