/*
OBJETIVO: Probar la lógica de negocio de productos
- Verifica validaciones y reglas de negocio
- Valida respuestas de éxito y error
- PASA: Si las validaciones y operaciones funcionan correctamente
- FALLA: Si hay errores en validaciones o lógica de negocio
*/

const ProductoService = require('../../services/ProductoService');
const ProductoRepository = require('../../repositories/ProductoRepository');

// Mock del repositorio para operaciones
jest.mock('../../repositories/ProductoRepository');

describe('ProductoService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar mocks entre pruebas
  });

  // PRUEBA 13: Verificar agregado exitoso de producto válido
  test('debería agregar un producto válido', async () => {
    // Datos válidos de producto completo
    const productoData = {
      nombre: 'Martillo Test',
      codigo: 'TEST001',
      precio: 25000,
      stock: 10
    };

    // Configurar repositorio para escenario exitoso
    ProductoRepository.buscarPorCodigo.mockResolvedValue(null);         // Código no existe
    ProductoRepository.crearProducto.mockResolvedValue(1);              // Creado con ID 1
    ProductoRepository.buscarPorId.mockResolvedValue({ id: 1, ...productoData }); // Producto completo

    // Ejecutar servicio de agregado
    const resultado = await ProductoService.agregar(productoData);

    // Verificar respuesta exitosa del servicio
    expect(resultado.success).toBe(true);  // Operación exitosa
    expect(resultado.status).toBe(201);    // Status Created
    expect(resultado.data.id).toBe(1);     // ID del producto creado
  });

  // PRUEBA 14: Verificar validación de campos obligatorios
  test('debería fallar con campos faltantes', async () => {
    // Datos incompletos para probar validación
    const productoIncompleto = { nombre: 'Test' };

    // Ejecutar servicio con datos incompletos
    const resultado = await ProductoService.agregar(productoIncompleto);

    // Verificar respuesta de error por validación
    expect(resultado.success).toBe(false);                       // Operación fallida
    expect(resultado.status).toBe(400);                          // Status Bad Request
    expect(resultado.message).toBe('Faltan campos obligatorios.'); // Mensaje específico
  });

  // PRUEBA 15: Verificar listado de productos
  test('debería listar productos', async () => {
    // Productos existentes en base de datos
    const productosExistentes = [
      { id: 1, nombre: 'Producto 1' },
      { id: 2, nombre: 'Producto 2' }
    ];

    // Configurar repositorio
    ProductoRepository.listarTodos.mockResolvedValue(productosExistentes);

    // Ejecutar servicio de listado
    const resultado = await ProductoService.listar();

    // Verificar resultado del listado
    expect(resultado).toHaveLength(2);                    // Debe tener 2 productos
    expect(ProductoRepository.listarTodos).toHaveBeenCalled(); // Debe llamar al repositorio
  });
});