const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
  email:{
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  nombre:{
    type: String,
    required: [true, 'Agrega tu nombre']
  },
  password:{
    type: String,
    required: true,
    trim: true
  },
  token: String,
  expira: Date
});
usuariosSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return;
  }
  const hash = await bcrypt.hash(this.password, 12);
  this.password = hash;
})

module.exports = mongoose.model('Usuarios', usuariosSchema)