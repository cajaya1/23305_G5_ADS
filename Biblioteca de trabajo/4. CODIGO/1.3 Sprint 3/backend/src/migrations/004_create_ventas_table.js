const pool = require('../config/db');

async function run() {
  console.log('Ejecutando migración: 004_create_ventas_table.js');
  
  // Crear tabla de ventas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ventas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      numero_factura VARCHAR(50) NOT NULL UNIQUE,
      cliente_id INT NULL,
      cliente_nombre VARCHAR(200) NOT NULL,
      cliente_cedula VARCHAR(20),
      cliente_direccion VARCHAR(255),
      cliente_telefono VARCHAR(20),
      cliente_email VARCHAR(100),
      subtotal DECIMAL(10, 2) NOT NULL,
      descuento DECIMAL(10, 2) DEFAULT 0,
      impuesto DECIMAL(10, 2) NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia') DEFAULT 'efectivo',
      estado ENUM('completada', 'cancelada', 'pendiente') DEFAULT 'completada',
      vendedor_id INT,
      notas TEXT,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
      FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
      INDEX idx_numero_factura (numero_factura),
      INDEX idx_cliente_id (cliente_id),
      INDEX idx_vendedor_id (vendedor_id),
      INDEX idx_fecha_creacion (creado_en),
      INDEX idx_estado (estado)
    );
  `);

  // Crear tabla de detalles de venta
  await pool.query(`
    CREATE TABLE IF NOT EXISTS venta_detalles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      venta_id INT NOT NULL,
      producto_id INT NOT NULL,
      producto_nombre VARCHAR(100) NOT NULL,
      producto_codigo VARCHAR(50) NOT NULL,
      cantidad INT NOT NULL,
      precio_unitario DECIMAL(10, 2) NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
      INDEX idx_venta_id (venta_id),
      INDEX idx_producto_id (producto_id),
      INDEX idx_fecha_creacion (creado_en)
    );
  `);

  console.log("✅ Tablas 'ventas' y 'venta_detalles' creadas correctamente.");
}

module.exports = { run };