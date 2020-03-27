const knex = require('../db');
const prehire = require('../db/prehire');
const TABLES = require('../db/prehire/tables');

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

const getApplicantPrehire = async ({ employerId, candidateId }) => {
  if (!employerId) throw new Error('employerId is required');

  if (!candidateId) throw new Error('candidateId is required');

  return prehire.raw(`
      select *
      from ${TABLES.applicants}
      where employerId = ${employerId}
      and taleoApplicantId = "${candidateId}"
    `);
};

module.exports = {
  getApplicantbyEntityId,
  getApplicantsByUserId,
  getApplicantPrehire
};
