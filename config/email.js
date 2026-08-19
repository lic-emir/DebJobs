const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../variables.env') });
module.exports = {
  user: process.env.USER_NAME,
  pass: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.PORT
}