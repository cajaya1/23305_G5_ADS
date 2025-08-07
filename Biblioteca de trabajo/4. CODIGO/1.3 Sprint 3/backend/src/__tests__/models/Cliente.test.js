/*
OBJETIVO: Probar el modelo Cliente
- Verifica que se creen correctamente los objetos Cliente
- Valida la conversión de tipos de datos
- PASA: Si los datos se asignan correctamente
- FALLA: Si hay problemas con tipos o propiedades
*/

const Cliente = require('../../models/Cliente');

describe('Modelo Cliente', () => {
  // PRUEBA 11: Verificar creación correcta con conversión de tipos
  test('debería crear un cliente correctamente', () => {
    // Datos de entrada para crear un cliente con tipo a convertir
    const datosCliente = {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      cedula: '1234567890',
      es_frecuente: 1 // Número que debe convertirse a boolean
    };

    // Crear instancia del cliente usando constructor
    const cliente = new Cliente(datosCliente);

    // Verificar que las propiedades se asignen correctamente
    expect(cliente.id).toBe(1);                    // ID debe ser 1
    expect(cliente.nombres).toBe('Juan');          // Nombres deben ser 'Juan'
    expect(cliente.es_frecuente).toBe(true);       // Conversión de 1 a true
  });

  // PRUEBA 12: Verificar manejo de objeto vacío sin errores
  test('debería manejar datos vacíos', () => {
    // Crear cliente con objeto vacío
    const cliente = new Cliente({});
    
    // Verificar que maneja datos undefined sin errores
    expect(cliente.es_frecuente).toBe(false);      // Valor por defecto false
    expect(cliente.id).toBeUndefined();            // ID undefined sin errores
  });
});