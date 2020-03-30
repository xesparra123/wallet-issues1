require('dotenv').config();
const knex = require('knex');

const { DB_HOST_PREHIRE, DB_SCHEMA_PREHIRE, DB_USERNAME_PREHIRE, DB_PASSWORD_PREHIRE } = process.env;

const config = {
  client: 'mysql2',
  debug: false,
  connection: {
    host: DB_HOST_PREHIRE,
    user: DB_USERNAME_PREHIRE,
    password: DB_PASSWORD_PREHIRE,
    database: DB_SCHEMA_PREHIRE
  },
  pool: { min: 0, max: 100 }
};

module.exports = knex(config);
