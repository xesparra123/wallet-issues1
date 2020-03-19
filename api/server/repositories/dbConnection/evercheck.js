const knex = require('knex');

const config = {
  client: 'oracledb',
  debug: false,
  connection: {
    host: process.env.HR_DB_HOST,
    user: process.env.HR_DB_USER,
    password: process.env.HR_DB_PASSWORD,
    database: process.env.HR_DB_NAME
  },
  pool: { min: 0, max: 100 }
};

module.exports = knex(config);
