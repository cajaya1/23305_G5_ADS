/**
 * Fachada de autenticación.
 * Orquesta la lógica de autenticación y delega la operación al servicio correspondiente.
 */

const AuthService = require('../services/AuthService');

const AuthFacade = {
  /**
   * Realiza el proceso de login.
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} 
   */
  async login(email, password) {
    return await AuthService.login(email, password);
  }
};

module.exports = AuthFacade;