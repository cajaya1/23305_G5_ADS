/*
CONFIGURACIÓN GLOBAL DE PRUEBAS
- Configuración de timeout y mocks de base de datos
- Establecimiento de variables globales
- Limpieza automática entre pruebas
*/

jest.setTimeout(5000);

// Mock de base de datos para todas las pruebas
const mockPool = {
  query: jest.fn().mockResolvedValue([]),
  end: jest.fn()                         
};

jest.doMock('../config/db', () => mockPool);

// Variable global para acceder al mock desde cualquier prueba
global.mockPool = mockPool;

afterEach(() => {
  jest.clearAllMocks(); 
});