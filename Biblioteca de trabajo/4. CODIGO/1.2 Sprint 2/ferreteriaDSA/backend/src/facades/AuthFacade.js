const AuthService = require('../services/AuthService');

const AuthFacade = {
  async login(email, password) {
    return await AuthService.login(email, password);
  }
};

module.exports = AuthFacade;
