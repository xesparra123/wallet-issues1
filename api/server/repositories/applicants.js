const knex = require('../db');
const prehire = require('../db/prehire');
const TABLES = require('../db/prehire/tables');

const applicantPositionRepository = require('./applicantPosition');

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

const getApplicantPrehireById = async ({ prehireApplicantId }) => {
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

const getApplicantPrehireByTaleoAndEmployerId = async ({
  taleoId,
  employerId
}) => {
  if (!taleoId || !employerId)
    throw new Error('prehireApplicantId is required');

  const result = await prehire.raw(`
      select 
      firstName,
      middleName,
      lastName,
      status,
      employerId,
      taleoApplicantId
      from ${TABLES.applicants}
      where taleoApplicantId = ${taleoId} and employerId = ${employerId}
    `);

  return result[0];
};

const deleteApplicantById = async id => {
  const positions = await applicantPositionRepository.findPositionsByApplicantId(
    id
  );

  for (const position of positions) {
    await applicantPositionRepository.deleteRequirementSetById(
      position.ApplicantRequirementSetId
    );
  }

  for (const position of positions) {
    await applicantPositionRepository.deletePositionSetById(
      position.ApplicantPositionSetId
    );

    await applicantPositionRepository.deletePositionById(
      position.ApplicantPositionId
    );
  }

  await knex
    .from('applicants')
    .where({ id })
    .del();
};

module.exports = {
  getApplicantbyEntityId,
  getApplicantsByUserId,
  getApplicantPrehireById,
  getApplicantPrehireByTaleoAndEmployerId,
  deleteApplicantById
};
