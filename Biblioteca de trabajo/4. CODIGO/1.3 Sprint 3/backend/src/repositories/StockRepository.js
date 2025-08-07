/**
 * Repositorio de stock.
 * Gestiona el acceso y las operaciones sobre el inventario de productos en la base de datos.
 */

const pool = require('../config/db');

const StockRepository = {
  // Verificar stock por ID
  async verificarStockPorId(id) {
    const [rows] = await pool.query(
      `SELECT id, nombre, codigo, descripcion, precio, stock, categoria, proveedor, fecha_caducidad 
       FROM productos WHERE id = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  // Verificar stock por código
  async verificarStockPorCodigo(codigo) {
    const [rows] = await pool.query(
      `SELECT id, nombre, codigo, descripcion, precio, stock, categoria, proveedor, fecha_caducidad 
       FROM productos WHERE codigo = ?`,
      [codigo]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  // Obtener productos con stock bajo
  async obtenerProductosStockBajo(limite = 10) {
    const [rows] = await pool.query(
      `SELECT id, nombre, codigo, stock, categoria, proveedor 
       FROM productos WHERE stock <= ? ORDER BY stock ASC`,
      [limite]
    );
    return rows;
  },

  // Obtener productos sin stock
  async obtenerProductosSinStock() {
    const [rows] = await pool.query(
      `SELECT id, nombre, codigo, stock, categoria, proveedor 
       FROM productos WHERE stock = 0 ORDER BY nombre ASC`
    );
    return rows;
  },

  // Obtener productos por nivel de stock
  async obtenerProductosPorNivelStock(nivelStock) {
    let whereClause = '';
    
    switch (nivelStock) {
      case 'critico':
        whereClause = 'stock = 0';
        break;
      case 'bajo':
        whereClause = 'stock > 0 AND stock <= 10';
        break;
      case 'medio':
        whereClause = 'stock > 10 AND stock <= 50';
        break;
      case 'alto':
        whereClause = 'stock > 50';
        break;
      default:
        whereClause = '1=1';
    }

    const [rows] = await pool.query(
      `SELECT id, nombre, codigo, stock, categoria, proveedor, precio 
       FROM productos WHERE ${whereClause} ORDER BY stock ASC`
    );
    return rows;
  },

  // Obtener resumen de stock
  async obtenerResumenStock() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_productos,
        SUM(stock) as total_stock,
        COUNT(CASE WHEN stock = 0 THEN 1 END) as productos_sin_stock,
        COUNT(CASE WHEN stock <= 10 THEN 1 END) as productos_stock_bajo,
        COUNT(CASE WHEN stock > 10 AND stock <= 50 THEN 1 END) as productos_stock_medio,
        COUNT(CASE WHEN stock > 50 THEN 1 END) as productos_stock_alto,
        AVG(stock) as promedio_stock,
        MIN(stock) as stock_minimo,
        MAX(stock) as stock_maximo
      FROM productos
    `);
    return rows[0];
  },

  // Obtener alertas de stock
  async obtenerAlertasStock() {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        nombre, 
        codigo, 
        stock, 
        categoria,
        CASE 
          WHEN stock = 0 THEN 'AGOTADO'
          WHEN stock <= 5 THEN 'CRÍTICO'
          WHEN stock <= 10 THEN 'BAJO'
          ELSE 'NORMAL'
        END as nivel_alerta
      FROM productos 
      WHERE stock <= 10 
      ORDER BY stock ASC, nombre ASC
    `);
    return rows;
  },

  // Actualizar solo stock de un producto
  async actualizarSoloStock(id, nuevoStock) {
    const [result] = await pool.query(
      `UPDATE productos SET stock = ? WHERE id = ?`,
      [nuevoStock, id]
    );
    return result.affectedRows > 0;
  },

  // Incrementar stock
  async incrementarStock(id, cantidad) {
    const [result] = await pool.query(
      `UPDATE productos SET stock = stock + ? WHERE id = ?`,
      [cantidad, id]
    );
    return result.affectedRows > 0;
  },

  // Decrementar stock
  async decrementarStock(id, cantidad) {
    const [result] = await pool.query(
      `UPDATE productos SET stock = GREATEST(0, stock - ?) WHERE id = ?`,
      [cantidad, id]
    );
    return result.affectedRows > 0;
  },

  // Obtener historial de movimientos de stock (si tuvieras tabla de historial)
  async obtenerHistorialStock(productoId, limite = 10) {
    // Por ahora retornamos array vacío, pero podrías implementar
    // una tabla de historial de movimientos de stock
    return [];
  },

  // Verificar si un producto existe
  async existeProducto(id) {
    const [rows] = await pool.query(
      `SELECT id FROM productos WHERE id = ?`,
      [id]
    );
    return rows.length > 0;
  },

  // Obtener productos con stock crítico por categoría
  async obtenerStockCriticoPorCategoria() {
    const [rows] = await pool.query(`
      SELECT 
        categoria,
        COUNT(*) as productos_criticos,
        SUM(stock) as stock_total_categoria
      FROM productos 
      WHERE stock <= 10 
      GROUP BY categoria 
      ORDER BY productos_criticos DESC
    `);
    return rows;
  }
};

module.exports = StockRepository;