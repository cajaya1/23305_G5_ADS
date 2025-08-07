const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');
const runMigrations = require('./migrations/runMigrations');

const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/cliente.routes');
const productoRoutes = require('./routes/producto.routes');
const stockRoutes = require('./routes/stock.routes');
const ventaRoutes = require('./routes/venta.routes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Registrar rutas
app.use('/api', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/ventas', ventaRoutes); 

// Verificar conexión y ejecutar migraciones
pool.getConnection()
  .then(connection => {
    console.log('Conexión a la base de datos exitosa.');
    connection.release();

    return runMigrations();
  })
  .then(() => {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos o ejecutar migraciones:', err);
    process.exit(1);
  });