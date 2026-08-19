const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');
const path = require('path');

let transport = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});

transport.use('compile', hbs.default({
  viewEngine: {
    extName: '.handlebars',
    partialsDir: path.join(__dirname, '../views/emails'), // Ajusta la ruta a tus carpetas
    layoutsDir: path.join(__dirname, '../views/emails'),
    defaultLayout: 'reset.handlebars',
  },
  viewPath: path.join(__dirname, '../views/emails'),
  extName: '.handlebars'
}));

exports.enviar = async (opciones) => {
  const opcionesEmail = {
    from: 'devJobs <noply@devJobs.com>',
    to: opciones.usuario.email,
    subject: opciones.subject,
    template: opciones.archivo,
    context:{
      resetUrl: opciones.resetUrl
    }
  }
  const sendMail = util.promisify(transport.sendMail, transport);
  return sendMail.call(transport, opcionesEmail);
}