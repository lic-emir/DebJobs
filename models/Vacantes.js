const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugify');
const shortid = require('shortid');

const vacantesSchema = new mongoose.Schema({
  titulo:{
    type: String,
    required: 'El nombre de la vacante es obligatorio',
    trim: true
  },
  empresa:{
    type: String,
    trim: true
  },
  ubicacion:{
    type: String,
    required: 'La ubicación es obligatoria',
    trim: true
  },
  salario:{
    type: String,
    default: 0,
    trim: true
  },
  contrato:{
    type: String,
    trim: true
  },
  descripcion:{
    type: String,
    trim: true
  },
  url:{
    type: String,
    lowercase: true
  },
  skills:[String],
  candidatos:[{
    nombre: String,
    email: String,
    cv: String
  }],
  autor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Usuarios',
    required: 'El autor es obligatorio'
  }
});
vacantesSchema.pre('save', async function(){
  if (this.isModified('titulo') || this.isNew) {
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;
  }
});

module.exports = mongoose.model('Vacante', vacantesSchema)