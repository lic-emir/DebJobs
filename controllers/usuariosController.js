const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

exports.formCrearCuenta = (req, res) => {
  res.render('crear-cuenta', {
    nombrePagina: 'Crea tu cuenta en DevJobs',
    tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
  });
}
exports.crearUsuario = async (req, res, next) => {
  const usuario = new Usuarios(req.body);

  try {
    const nuevoUsuario = await usuario.save();
    res.redirect('/iniciar-sesion')
  } catch (error) {
    return next(error);
  }
}