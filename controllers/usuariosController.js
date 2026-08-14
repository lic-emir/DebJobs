const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');

exports.formCrearCuenta = (req, res) => {
  res.render('crear-cuenta', {
    nombrePagina: 'Crea tu cuenta en DevJobs',
    tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta'
  });
}
exports.validarUsuario = [
  // 1. Sanitización y Reglas de Validación (modifican req.body)
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .trim()
    .escape(),
  body('email')
    .isEmail().withMessage('El email debe ser válido')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false
    })
    .trim()
    .custom(async (email) => {
      const existeUsuario = await Usuarios.findOne({email});
      if (existeUsuario) {
        throw new Error('El correo electrónico ya esta registrado')
      }
    }),
  body('password')
    .notEmpty().withMessage('El password no puede ir vacío')
    .isLength({ min: 6 }).withMessage('El password debe tener al menos 6 caracteres')
    .trim()
    .escape(),
  body('confirmar')
    .notEmpty().withMessage('Confirmar password es obligatorio')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Los passwords no coinciden');
      }
      return true;
    })
    .trim()
    .escape(),

  // 2. Evaluador de resultados de la validación

  (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      // Si hay errores, volvemos a renderizar la vista pasando los mensajes y datos cargados
      return res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en DevJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
        mensajes: {
          error: errores.array().map(e => e.msg)
        },
        formData: req.body
      });
    }

    // Si la validación pasa, continuamos hacia crearUsuario
    next();
  }
];
exports.crearUsuario = async (req, res, next) => {
  const usuario = new Usuarios(req.body);
  const errores = validationResult(req)

  if (!errores.isEmpty()) {
    return res.render('crear-cuenta', {
      nombrePagina: 'Crea tu cuenta en DevJobs',
      tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear una cuenta',
      mensajes: errores.array().map(err => err.msg),
      formData: req.body
    })
  }

  try {
    const nuevoUsuario = await usuario.save();
    res.redirect('/iniciar-sesion')
  } catch (error) {
    return next(error);
  }
}
exports.formIniciarSesion = (req, res) => {
  res.render('iniciar-sesion', {
    nombrePagina: 'Iniciar Sesión DevJobs'
  })
}
exports.formEditarPerfil = (req, res) => {
  res.render('editar-perfil', {
    nombrePagina: 'Edita tu pefil en DevJobs',
    cerrarSesion: true,
    nombre: req.user.nombre,
    usuario: req.user.toObject(),
    imagen: req.user.imagen
  });
}
exports.editarPerfil = async (req, res, next) => {
  try {
    const usuario = await Usuarios.findById(req.user._id);
    const passViejo = await usuario.compararPassword(req.body.password);
    if (!passViejo) {
      return res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en DevJobs',
        usuario: req.user.toObject(), // Importante: volver a pasar el usuario para que la vista no pierda sus datos
        mensajes: {
          error: ['La contraseña actual es incorrecta'] // <-- Debe ser un objeto con array
        }
      });
    }
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if (req.body['nuevo-password'] && req.body['nuevo-password'].trim() !== '') {
        usuario.password = req.body['nuevo-password'];
    }
    if (req.file) {
      usuario.imagen = req.file.filename;
    }
    await usuario.save();
    req.session.mensajes = {
      correcto: ['Cambios guardados correctamente']
    }
    res.redirect('/administracion');
  } catch (error) {
    return next(error);
  }
}
exports.validarPerfil = [
  body('nombre')
    .notEmpty().withMessage('El nombre no puede ir vacío')
    .trim()
    .escape(),
  body('email')
    .isEmail().withMessage('El correo debe ser un email válido')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false
    })
    .trim(),
  body('password')
    .notEmpty().withMessage('El password actual es obligatorio para guardar cambios'),
  body('nuevo-password')
    .optional({ checkFalsy: true }) // Solo valida si el campo no está vacío
    .isLength({ min: 6 }).withMessage('El nuevo password debe tener al menos 6 caracteres'),

  (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en DevJobs',
        // Mezclamos req.user con req.body para conservar el texto modificado en los inputs
        usuario: { ...req.user.toObject(), ...req.body }, 
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        mensajes: {
          error: errores.array().map(e => e.msg)
        }
      });
    }

    // Avanza al middleware editarPerfil si la validación fue exitosa
    next(); 
  }
];

const configMulter = {
  limits: {fileSize: 1000000},
  storage: fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname+'../../public/uploads/perfiles')
    },
    filename: (req, file, cb) =>{
      const extension = file.mimetype.split('/')[1];
      cb(null, `${shortid.generate()}.${extension}`);
    }
  }),
  fileFilter(req, file, cb){
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
      cb(null, true);
    }else{
      cb(new Error('Formato no válido'), false);
    }
  }
}
const upload = multer(configMulter).single('imagen');

exports.subirImagen = (req, res, next) => {
  upload(req, res, function(error){
    if (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          req.session.mensajes = {
            error: ['El archivo es muy grande: Max 1MB']
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
      res.redirect('/administracion');
      return;
    }else{
      return next();
    }
  });
}