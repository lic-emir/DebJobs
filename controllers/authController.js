const passport = require('passport');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
//opciones automáticas de passport, para pasar mensajes se necesita connect-flash
/*exports.autenticarUsuario = passport.authenticate('local', {
  successRedirect: '/administracion',
  failureRedirect: '/iniciar-sesision'
})*/
exports.autenticarUsuario = (req, res, next) => {
  //custom callback, control absoluto sobre qué hacer cuando la autenticación falla o tiene éxito. No necesita connect-flash
  passport.authenticate('local', (err, usuario, info) => {
    // Si ocurre un error de servidor o base de datos
    if (err) return next(err);

    // Si la autenticación falla (usuario no existe o password incorrecto)
    if (!usuario) {
      return res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión en devJobs',
        mensajes: {
          error: [info.message] // El mensaje proviene del done(null, false, {message: '...'})
        }
      });
    }

    // Si las credenciales son correctas, iniciar sesión e ir a la ruta protegida
    req.login(usuario, (err) => {
      if (err) return next(err);
      return res.redirect('/administracion');
    });
  })(req, res, next);
};
exports.verificarUsuario = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/iniciar-sesion')
}
exports.mostrarPanel = async (req, res) => {
  const vacantes = await Vacante.find({autor: req.user._id}).lean();

  res.render('administracion', {
    nombrePagina: 'Panel de Administración',
    tagline: 'Crea y Administra tus vacantes desde aquí',
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    vacantes
  })
}
exports.cerrarSesion = (req, res, next) => {
  req.logout(function(err){
    if(err){
      return next(err)
    }
    req.session.mensajes = {
      correcto: ['Cerraste sesión correctamente']
    }
    return res.redirect('/iniciar-sesion')
  });
}