const knex = require('../db');

const findPositionsByEmployeeId = async employeeId => {
  const select = [
    'employees.id as employeeId',
    'employee_positions.id as employeePositionId',
    'employee_positions_sets.id as employeePositionSetId',
    'employee_requirement_set.id as employeeRequirementSetId'
  ];

  return await knex
    .select(select)
    .from('employees')
    .innerJoin(
      'employee_positions',
      'employees.id',
      'employee_positions.employeeId'
    )
    .innerJoin(
      'employee_positions_sets',
      'employee_positions.id',
      'employee_positions_sets.employee_position_id'
    )
    .innerJoin(
      'employee_requirement_set',
      'employee_positions_sets.id',
      'employee_requirement_set.employee_position_set_id'
    )
    .where('employees.id', employeeId);
};

const deletePositionById = id => {
  return knex
    .from('employee_positions')
    .where({ id })
    .del();
};

const deletePositionSetById = id => {
  return knex
    .from('employee_positions_sets')
    .where({ id })
    .del();
};

const deleteRequirementSetById = id => {
  return knex
    .from('employee_requirement_set')
    .where({ id })
    .del();
};

module.exports = {
  findPositionsByEmployeeId,
  deletePositionById,
  deletePositionSetById,
  deleteRequirementSetById
};
