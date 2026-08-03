exports.formCrearCuenta = (req, res) => {
  res.render('crear-cuenta', {
    nombrePagina: 'Crea tu cuenta en DevJobs',
    tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
  });
}