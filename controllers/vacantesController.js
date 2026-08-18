const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
  res.render('nueva-vacante', {
    nombrePagina: 'Nueva Vacante',
    tagline: 'Llena el formulario y publica tu vacante',
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen
  })
}
exports.agregarVacante = async (req, res) => {
  const vacante = new Vacante(req.body);
  vacante.autor = req.user._id;
  vacante.skills = req.body.skills.split(',');
  
  const nuevaVacante = await vacante.save();

  res.redirect(`/vacantes/${nuevaVacante.url}`)
}
exports.mostrarVacante = async (req, res, next) => {
  const vacante = await Vacante.findOne({url: req.params.url}).populate('autor', 'nombre email imagen').lean();
  
  if(!vacante) return next();

  res.render('vacante', {
    vacante,
    nombrePagina:vacante.titulo,
    barra:true
  });
}
exports.formEditarVacante = async (req, res, next) => {
  const vacante = await Vacante.findOne({url: req.params.url}).lean();

  if(!vacante) return next();

  res.render('editar-vacante', {
    vacante,
    nombrePagina: `Editar - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen
  });
}
exports.editarVacante = async (req, res) => {
  const vacanteActualizada = req.body;
  vacanteActualizada.skills = req.body.skills.split(',');
  const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {returnDocument: 'after', runValidators:true});
  res.redirect(`/vacantes/${vacante.url}`);
}
exports.validarVacante = [
  body('titulo')
    .trim()
    .escape()
    .notEmpty().withMessage('Agrega un titulo a la vacante'),
  body('empresa')
    .trim()
    .escape()
    .notEmpty().withMessage('Agrega una empresa'),
  body('ubicacion')
    .trim()
    .escape()
    .notEmpty().withMessage('Agrega una ubicación'),
  body('contrato')
    .trim()
    .escape()
    .notEmpty().withMessage('Selecciona el tipo de contrato'),
  body('skills')
    .trim()
    .escape()
    .notEmpty().withMessage('Agrega al menos una habilidad'),
  (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      // Reconstruimos el objeto vacante con req.body para no perder lo ingresado
      const vacante = { ...req.body };
      
      // Convertir skills a array si la vista necesita iterar sobre ellos
      if (typeof req.body.skills === 'string') {
        vacante.skills = req.body.skills.split(',').filter(Boolean);
      }

      // Si la URL trae un parametro 'url', estamos en la ruta de editar
      const esEdicion = Boolean(req.params.url);
      const vista = esEdicion ? 'editar-vacante' : 'nueva-vacante';
      const nombrePagina = esEdicion ? `Editar - ${vacante.titulo || ''}` : 'Nueva Vacante';

      // Si es edición, preservamos la URL para el atributo action del formulario
      if (esEdicion) {
        vacante.url = req.params.url;
      }

      return res.render(vista, {
        nombrePagina,
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        mensajes: {
          error: errores.array().map(e => e.msg)
        },
        vacante // Se envía req.body mapeado como vacante
      });
    }

    next();
  }
]
exports.eliminarVacante = async (req, res) => {
  const {id} = req.params;
  const vacante = await Vacante.findById(id);

  if (!vacante) {
    res.status(404).send('Vacante no encontrada');
  }
  
  if (verificarAutor(vacante, req.user)) {
    await vacante.deleteOne();
    res.status(200).send('Vacante eliminada correctamente');
  } else {
    res.status(403).send('Error');
  }
}
const verificarAutor = (vacante = {}, usuario = {}) => {
  if (!vacante.autor.equals(usuario._id)) {
    return false;
  }
  return true;
}

const configMulter = {
  limits: {fileSize: 500000},
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname+'../../public/uploads/cv')
    },
    filename: (req, file, cb) =>{
      const extension = file.mimetype.split('/')[1];
      cb(null, `${shortid.generate()}.${extension}`);
    }
  }),
  fileFilter(req, file, cb){
    if(file.mimetype === 'application/pdf'){
      cb(null, true);
    }else{
      cb(new Error('Formato no válido'), false);
    }
  }
}
const upload = multer(configMulter).single('cv');
exports.subirCV = (req, res, next) => {
  upload(req, res, function(error){
    if (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          req.session.mensajes = {
            error: ['El archivo es muy grande: Max 500KB']
          }
        }else{
          req.session.mensajes = {
            error: [error.message]
          }
        }
      }else{
        req.session.mensajes = {
          error: [error.message]
        }
      }
      const destino = req.get('Referer') || `/vacantes/${req.params.url}`;
      res.redirect(destino);
      return;
    }else{
      return next();
    }
  });
}
exports.contactar = async(req, res, next)=>{
  const vacante = await Vacante.findOne({url: req.params.url});

  if(!vacante) return next();

  const nuevoCandidato = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv: req.file.filename
  }
  vacante.candidatos.push(nuevoCandidato);
  await vacante.save();

  req.session.mensajes = {
    correcto: ['Tu CV se envió correctamente']
  }
  res.redirect('/');
}