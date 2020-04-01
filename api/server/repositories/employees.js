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

const getEmployeesByUserId = async userId => {
  if (!userId) throw new Error('userId is required');

  return knex
    .select('*')
    .from('employees')
    .where('employees.userId', userId);
};

const updateEmployee = async (data, id) => {
  return knex('employees')
    .update(data)
    .where({ id });
};

module.exports = {
  getEmployeeByEntityId,
  getEmployeesByUserId,
  updateEmployee
};
