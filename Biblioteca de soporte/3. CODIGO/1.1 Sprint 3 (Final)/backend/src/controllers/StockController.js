/**
 * Controlador de stock.
 * Gestiona las peticiones HTTP relacionadas con el inventario y delega la lógica a la fachada de stock.
 */

const StockFacade = require('../facades/StockFacade');

const StockController = {
  // Verificar stock de un producto
  async verificarStock(req, res) {
    try {
      const identificador = req.params.identificador;
      
      if (!identificador) {
        return res.status(400).json({
          success: false,
          message: 'Identificador del producto es requerido.'
        });
      }

      const resultado = await StockFacade.verificarStock(identificador);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al verificar stock:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno al verificar el stock. No se pudo acceder a la base de datos.' 
      });
    }
  },

  // Obtener resumen completo del inventario
  async obtenerResumenInventario(req, res) {
    try {
      const resultado = await StockFacade.obtenerResumenInventario();
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al obtener resumen de inventario:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno al obtener resumen del inventario.' 
      });
    }
  },

  // Actualizar stock manualmente
  async actualizarStock(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { nuevoStock } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID del producto inválido.'
        });
      }

      if (nuevoStock === undefined || nuevoStock === null) {
        return res.status(400).json({
          success: false,
          message: 'El nuevo stock es requerido.'
        });
      }

      const resultado = await StockFacade.actualizarStock(id, nuevoStock);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al actualizar stock:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno al actualizar el stock.' 
      });
    }
  },

  // Incrementar stock
  async incrementarStock(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { cantidad } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID del producto inválido.'
        });
      }

      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad debe ser un número positivo.'
        });
      }

      const resultado = await StockFacade.incrementarStock(id, cantidad);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al incrementar stock:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno al incrementar el stock.' 
      });
    }
  },

  // Decrementar stock
  async decrementarStock(req, res) {
    try {
      const id = parseInt(req.params.id);
      const { cantidad } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID del producto inválido.'
        });
      }

      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad debe ser un número positivo.'
        });
      }

      const resultado = await StockFacade.decrementarStock(id, cantidad);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al decrementar stock:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno al decrementar el stock.' 
      });
    }
  },

  // Obtener productos por nivel de stock
  async obtenerProductosPorNivel(req, res) {
    try {
      const nivelStock = req.params.nivel;
      
      if (!nivelStock) {
        return res.status(400).json({
          success: false,
          message: 'Nivel de stock es requerido.'
        });
      }

      const resultado = await StockFacade.obtenerProductosPorNivel(nivelStock);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al obtener productos por nivel:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno al obtener productos por nivel de stock.' 
      });
    }
  }
};

module.exports = StockController;