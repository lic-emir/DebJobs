exports.mostrarTrabajos = (req, res) => {
  res.render('home', {
    nombrePagina: 'devJobs',
    tagline: 'Encuentra y Publica Trabajos para Desarrolladores web',
    barra: true,
    boton: true
  })
}