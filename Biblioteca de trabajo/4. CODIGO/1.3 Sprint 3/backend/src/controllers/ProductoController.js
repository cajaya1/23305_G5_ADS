/**
 * Controlador de productos.
 * Gestiona las peticiones HTTP relacionadas con productos y delega la lógica a la fachada de productos.
 */

const ProductoFacade = require('../facades/ProductoFacade');

const ProductoController = {
    /**
   * Agrega un nuevo producto.
   */
  async agregar(req, res) {
    try {
      const resultado = await ProductoFacade.agregar(req.body);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al agregar producto:', err);
      return res.status(500).json({ message: 'Error interno al agregar el producto.' });
    }
  },

  async listar(req, res) {
    try {
      const productos = await ProductoFacade.listar();
      return res.status(200).json({ success: true, data: productos });
    } catch (err) {
      console.error('Error al listar productos:', err);
      return res.status(500).json({ message: 'Error interno al listar productos.' });
    }
  },

  async buscar(req, res) {
    try {
      const criterios = {
        nombre: req.query.nombre,
        id: req.query.id,
        precioMin: req.query.precioMin,
        precioMax: req.query.precioMax
      };

      const resultado = await ProductoFacade.buscar(criterios);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al buscar productos:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno al buscar productos. No se pudo acceder a la base de datos.' 
      });
    }
  },

  // NUEVO: Actualizar producto
  async actualizar(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID del producto inválido.'
        });
      }

      const resultado = await ProductoFacade.actualizar(id, req.body);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno al actualizar el producto. No se pudo acceder a la base de datos.' 
      });
    }
  },

  // NUEVO: Eliminar producto
  async eliminar(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID del producto inválido.'
        });
      }

      const resultado = await ProductoFacade.eliminar(id);
      return res.status(resultado.status).json(resultado);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno al eliminar el producto. No se pudo acceder a la base de datos.' 
      });
    }
  }
};

module.exports = ProductoController;