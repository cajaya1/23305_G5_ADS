/**
 * Repositorio de ventas.
 * Gestiona el acceso y las operaciones sobre las tablas 'ventas' y 'venta_detalles' en la base de datos.
 */

const pool = require('../config/db');

const VentaRepository = {
  // Crear una nueva venta
  async crearVenta(venta) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insertar venta
      const [ventaResult] = await connection.query(
        `INSERT INTO ventas (numero_factura, cliente_id, cliente_nombre, cliente_cedula, 
         cliente_direccion, cliente_telefono, cliente_email, subtotal, descuento, 
         impuesto, total, metodo_pago, estado, vendedor_id, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          venta.numero_factura, venta.cliente_id, venta.cliente_nombre, 
          venta.cliente_cedula, venta.cliente_direccion, venta.cliente_telefono,
          venta.cliente_email, venta.subtotal, venta.descuento, venta.impuesto,
          venta.total, venta.metodo_pago, venta.estado, venta.vendedor_id, venta.notas
        ]
      );

      const ventaId = ventaResult.insertId;

      // Insertar detalles de venta
      for (const detalle of venta.detalles) {
        await connection.query(
          `INSERT INTO venta_detalles (venta_id, producto_id, producto_nombre, 
           producto_codigo, cantidad, precio_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            ventaId, detalle.producto_id, detalle.producto_nombre,
            detalle.producto_codigo, detalle.cantidad, detalle.precio_unitario,
            detalle.subtotal
          ]
        );

        // Actualizar stock del producto
        await connection.query(
          `UPDATE productos SET stock = stock - ? WHERE id = ?`,
          [detalle.cantidad, detalle.producto_id]
        );
      }

      await connection.commit();
      return ventaId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Obtener venta por ID
  async obtenerVentaPorId(id) {
    const [ventaRows] = await pool.query(
      `SELECT * FROM ventas WHERE id = ?`,
      [id]
    );

    if (ventaRows.length === 0) {
      return null;
    }

    const venta = ventaRows[0];

    // Obtener detalles de la venta
    const [detalleRows] = await pool.query(
      `SELECT * FROM venta_detalles WHERE venta_id = ? ORDER BY id`,
      [id]
    );

    venta.detalles = detalleRows;
    return venta;
  },

  // Obtener venta por número de factura
  async obtenerVentaPorNumeroFactura(numeroFactura) {
    const [ventaRows] = await pool.query(
      `SELECT * FROM ventas WHERE numero_factura = ?`,
      [numeroFactura]
    );

    if (ventaRows.length === 0) {
      return null;
    }

    const venta = ventaRows[0];

    // Obtener detalles de la venta
    const [detalleRows] = await pool.query(
      `SELECT * FROM venta_detalles WHERE venta_id = ? ORDER BY id`,
      [venta.id]
    );

    venta.detalles = detalleRows;
    return venta;
  },

  // Listar ventas con filtros
  async listarVentas(filtros = {}) {
    let query = `
      SELECT v.*, u.nombre as vendedor_nombre
      FROM ventas v
      LEFT JOIN usuarios u ON v.vendedor_id = u.id
      WHERE 1=1
    `;
    let params = [];

    // Filtro por fecha
    if (filtros.fecha_inicio) {
      query += ` AND DATE(v.creado_en) >= ?`;
      params.push(filtros.fecha_inicio);
    }

    if (filtros.fecha_fin) {
      query += ` AND DATE(v.creado_en) <= ?`;
      params.push(filtros.fecha_fin);
    }

    // Filtro por cliente
    if (filtros.cliente_nombre) {
      query += ` AND v.cliente_nombre LIKE ?`;
      params.push(`%${filtros.cliente_nombre}%`);
    }

    // Filtro por vendedor
    if (filtros.vendedor_id) {
      query += ` AND v.vendedor_id = ?`;
      params.push(filtros.vendedor_id);
    }

    // Filtro por estado
    if (filtros.estado) {
      query += ` AND v.estado = ?`;
      params.push(filtros.estado);
    }

    query += ` ORDER BY v.creado_en DESC`;

    // Paginación
    if (filtros.limite) {
      query += ` LIMIT ?`;
      params.push(parseInt(filtros.limite));
      
      if (filtros.offset) {
        query += ` OFFSET ?`;
        params.push(parseInt(filtros.offset));
      }
    }

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Obtener estadísticas de ventas
  async obtenerEstadisticasVentas(filtros = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_ventas,
        SUM(total) as total_ingresos,
        AVG(total) as promedio_venta,
        MIN(total) as venta_minima,
        MAX(total) as venta_maxima,
        SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END) as efectivo,
        SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END) as tarjeta,
        SUM(CASE WHEN metodo_pago = 'transferencia' THEN total ELSE 0 END) as transferencia
      FROM ventas 
      WHERE estado = 'completada'
    `;
    let params = [];

    if (filtros.fecha_inicio) {
      query += ` AND DATE(creado_en) >= ?`;
      params.push(filtros.fecha_inicio);
    }

    if (filtros.fecha_fin) {
      query += ` AND DATE(creado_en) <= ?`;
      params.push(filtros.fecha_fin);
    }

    const [rows] = await pool.query(query, params);
    return rows[0];
  },

  // Obtener productos más vendidos
  async obtenerProductosMasVendidos(limite = 10) {
    const [rows] = await pool.query(`
      SELECT 
        vd.producto_id,
        vd.producto_nombre,
        vd.producto_codigo,
        SUM(vd.cantidad) as total_vendido,
        COUNT(DISTINCT vd.venta_id) as numero_ventas,
        SUM(vd.subtotal) as ingresos_totales
      FROM venta_detalles vd
      INNER JOIN ventas v ON vd.venta_id = v.id
      WHERE v.estado = 'completada'
      GROUP BY vd.producto_id, vd.producto_nombre, vd.producto_codigo
      ORDER BY total_vendido DESC
      LIMIT ?
    `, [limite]);

    return rows;
  },

  // Verificar stock disponible
  async verificarStockDisponible(productosVenta) {
    const connection = await pool.getConnection();
    const productosInsuficientes = [];

    try {
      for (const producto of productosVenta) {
        const [stockRows] = await connection.query(
          `SELECT stock FROM productos WHERE id = ?`,
          [producto.producto_id]
        );

        if (stockRows.length === 0) {
          productosInsuficientes.push({
            producto_id: producto.producto_id,
            error: 'Producto no encontrado'
          });
        } else if (stockRows[0].stock < producto.cantidad) {
          productosInsuficientes.push({
            producto_id: producto.producto_id,
            stock_disponible: stockRows[0].stock,
            cantidad_solicitada: producto.cantidad,
            error: 'Stock insuficiente'
          });
        }
      }

      return productosInsuficientes;

    } finally {
      connection.release();
    }
  },

  // Cancelar venta
  async cancelarVenta(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Obtener detalles de la venta
      const [detalleRows] = await connection.query(
        `SELECT * FROM venta_detalles WHERE venta_id = ?`,
        [id]
      );

      // Restaurar stock
      for (const detalle of detalleRows) {
        await connection.query(
          `UPDATE productos SET stock = stock + ? WHERE id = ?`,
          [detalle.cantidad, detalle.producto_id]
        );
      }

      // Cambiar estado de la venta
      const [result] = await connection.query(
        `UPDATE ventas SET estado = 'cancelada' WHERE id = ?`,
        [id]
      );

      await connection.commit();
      return result.affectedRows > 0;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Obtener ventas por cliente
  async obtenerVentasPorCliente(clienteId) {
    const [rows] = await pool.query(
      `SELECT * FROM ventas WHERE cliente_id = ? ORDER BY creado_en DESC`,
      [clienteId]
    );
    return rows;
  }
};

module.exports = VentaRepository;