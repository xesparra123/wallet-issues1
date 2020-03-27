const knex = require('../db');

const getApplicantbyEntityId = async entityId => {
  //Validations
  if (!entityId) throw new Error('entityId is required');

  //Execution

  let employee = await knex
    .select('*')
    .from('applicants')
    .where('applicants.id', entityId);

  return employee;
};

const getApplicantsByUserId = async userId => {
  if (!userId) throw new Error('userId is required');

  return knex
    .select('*')
    .from('applicants')
    .where('applicants.userId', userId);
};

module.exports = { getApplicantbyEntityId, getApplicantsByUserId };
