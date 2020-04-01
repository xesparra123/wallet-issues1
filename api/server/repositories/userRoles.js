const knex = require('../db');

const createUserRole = () => {
  //Validations

  //Execution

  return knex('user_roles').insert({});
};

module.exports = { createUserRole };
