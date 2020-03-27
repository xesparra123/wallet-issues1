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

const getApplicantPrehire = async ({ prehireApplicantId }) => {
  if (!prehireApplicantId) throw new Error('prehireApplicantId is required');

  const result = await prehire.raw(`
      select 
      firstName,
      middleName,
      lastName,
      status,
      employerId,
      taleoApplicantId
      from ${TABLES.applicants}
      where id = ${prehireApplicantId}
    `);
  
  return result[0];
};

module.exports = {
  getApplicantbyEntityId,
  getApplicantsByUserId,
  getApplicantPrehire
};
