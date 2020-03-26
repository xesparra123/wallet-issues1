const knex = require('../db');


const getEmployeeByEntityId = async entityId => {
  //Validations
  if (!entityId) throw new Error('entityId is required');

  //Execution

  let employee = await knex
    .select('*')
    .from('employees')
    .where('employees.id', entityId);
  
  return employee;

};

module.exports = { getEmployeeByEntityId };