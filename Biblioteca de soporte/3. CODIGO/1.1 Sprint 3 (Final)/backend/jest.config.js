/*
CONFIGURACIÓN DE JEST OPTIMIZADA
- Timeout reducido para pruebas rápidas
- Configuración mínima pero completa
- Solo para entorno de pruebas
*/

module.exports = {
  testEnvironment: 'node',
  testTimeout: 5000, // 5 segundos máximo por prueba
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!src/config/**',
    '!src/migrations/**',
    '!src/__tests__/**'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/__tests__/setup.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};