/*
OBJETIVO: Probar la lógica de negocio de clientes
- Verifica registro y búsqueda de clientes
- Valida prevención de duplicados
- PASA: Si el registro y búsqueda funcionan correctamente
- FALLA: Si hay problemas con validaciones o datos duplicados
*/

const ClienteService = require('../../services/ClienteService');
const ClienteRepository = require('../../repositories/ClienteRepository');

// Mock del repositorio para operaciones de base de datos
jest.mock('../../repositories/ClienteRepository');

describe('ClienteService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpiar mocks entre pruebas
  });

  // PRUEBA 9: Verificar registro exitoso de cliente nuevo
  test('debería registrar un cliente nuevo', async () => {
    // Datos del cliente a registrar
    const clienteData = {
      nombres: 'Juan',
      apellidos: 'Pérez',
      cedula: '1234567890'
    };

    // Configurar repositorio para escenario exitoso
    ClienteRepository.buscarPorCedula.mockResolvedValue(null); // Cliente no existe
    ClienteRepository.crearCliente.mockResolvedValue(1);       // Creado con ID 1

    // Ejecutar servicio de registro
    const resultado = await ClienteService.registrar(clienteData);

    // Verificar respuesta exitosa del servicio
    expect(resultado.success).toBe(true);  // Operación exitosa
    expect(resultado.status).toBe(201);    // Status Created
    expect(resultado.data.id).toBe(1);     // ID del cliente creado
  });

  // PRUEBA 10: Verificar prevención de clientes duplicados
  test('debería fallar si el cliente ya existe', async () => {
    // Datos de cliente con cédula existente
    const clienteData = { cedula: '1234567890' };

    // Cliente existente en base de datos
    ClienteRepository.buscarPorCedula.mockResolvedValue({ id: 1 });

    // Ejecutar servicio con cliente duplicado
    const resultado = await ClienteService.registrar(clienteData);

    // Verificar respuesta de error por duplicado
    expect(resultado.success).toBe(false);                    // Operación fallida
    expect(resultado.status).toBe(400);                       // Status Bad Request
    expect(resultado.message).toContain('ya está registrado'); // Mensaje de duplicado
  });
});