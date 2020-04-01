const knex = require('../db');

const findPositionsByApplicantId = async applicantId => {
  const select = [
    'applicants.id as applicantId',
    'applicant_positions.id as applicantPositionId',
    'applicant_positions_sets.id as applicantPositionSetId',
    'applicant_requirement_set.id as applicantRequirementSetId'
  ];

  return await knex
    .select(select)
    .from('applicants')
    .innerJoin(
      'applicant_positions',
      'applicants.id',
      'applicant_positions.applicantId'
    )
    .innerJoin(
      'applicant_positions_sets',
      'applicant_positions.id',
      'applicant_positions_sets.applicant_position_id'
    )
    .innerJoin(
      'applicant_requirement_set',
      'applicant_positions_sets.id',
      'applicant_requirement_set.applicant_position_set_id'
    )
    .where('applicants.id', applicantId);
};

const deletePositionById = id => {
  return knex
    .from('applicant_positions')
    .where({ id })
    .del();
};

const deletePositionSetById = id => {
  return knex
    .from('applicant_positions_sets')
    .where({ id })
    .del();
};

const deleteRequirementSetById = id => {
  return knex
    .from('applicant_requirement_set')
    .where({ id })
    .del();
};

module.exports = {
  findPositionsByApplicantId,
  deletePositionById,
  deletePositionSetById,
  deleteRequirementSetById
};
