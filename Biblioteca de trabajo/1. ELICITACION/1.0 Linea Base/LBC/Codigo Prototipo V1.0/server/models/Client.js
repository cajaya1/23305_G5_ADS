// models/Client.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Client = sequelize.define('Client', {
  cedula: { type: DataTypes.STRING, primaryKey: true },
  nombres: DataTypes.STRING,
  apellidos: DataTypes.STRING,
  email: DataTypes.STRING,
  direccion: DataTypes.STRING,
  telefono: DataTypes.STRING,
});

module.exports = Client;
