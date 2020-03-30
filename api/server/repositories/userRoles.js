const knex = require('../db');

const updateRoleStatus = async (roleId, status) => {
  return await knex
    .update({ status })
    .from('user_roles')
    .where({ id: roleId });
};

const deleteUserRole = async (roleId, entity) => {
  return await knex
    .from('user_roles')
    .where({ id: roleId, cd_entity: entity })
    .del();
};

const findUserRole = async (roleId, entity) => {
  const result = await knex
    .select()
    .from('user_roles')
    .where({ id: roleId, cd_entity: entity });

  return result[0];
};

const createUserRole = async payload => {
  return await knex.insert(payload).into('user_roles');
};

module.exports = {
  updateRoleStatus,
  deleteUserRole,
  findUserRole,
  createUserRole
};
