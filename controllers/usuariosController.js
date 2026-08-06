const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const { body, validationResult } = require('express-validator');

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