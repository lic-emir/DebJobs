const mongoose = require('mongoose');
const path = require('path');
require('../models/Vacantes');
require('../models/Usuarios');


require('dotenv').config({ path: path.resolve(__dirname, '../variables.env') });

mongoose.connect(process.env.DATA_BASE)
  .then(() => console.log('MongoDB conectado'))
  .catch((error) => {
    console.error('Error de conexión a MongoDB:', error);
  });

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

