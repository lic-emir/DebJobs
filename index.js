const mongoose = require('mongoose');
require('./config/db');
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const bodyParser = require('body-parser');


require('dotenv').config({ path: path.resolve(__dirname, 'variables.env') });
require('./config/db');

const app = express();

//habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//habilitar handlebar como template engine
app.engine('handlebars',
  exphbs.engine({
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars')
  })
);
app.set('view engine', 'handlebars');

//static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(session({
  secret: process.env.SECRETO,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DATA_BASE })
}))

app.use('/', router());

app.listen(process.env.PUERTO, () => {
  console.log(`Servidor corriendo en el puerto ${process.env.PUERTO}`);
});