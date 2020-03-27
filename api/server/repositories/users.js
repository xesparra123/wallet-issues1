const knex = require('../db');

const userByAccountId = async accountId => {
  //Validations
  if (!accountId) throw new Error('accountId is required');

  //Execution

  let user = await knex
    .select('*')
    .from('users')
    .where('users.accountId', accountId);
  return user;
};

const userById = async id => {
  //Validations
  if (!id) throw new Error('id is required');

  //Execution

  let user = await knex
    .select('*')
    .from('users')
    .where('users.id', id);
  return user;
};

const userRolesByUserId = async userId => {
  //Validations
  if (!userId) throw new Error('userId is required');

  //Execution

  let userRoles = await knex
    .select('*')
    .from('user_roles')
    .where('user_roles.userId', userId);

  return userRoles;
};

const userRolesEmployeeByUserId = async userId => {
  //Validations
  if (!userId) throw new Error('userId is required');

  let userRoles = await knex
    .select('*')
    .from('user_roles')
    .where('user_roles.userId', userId);

  return userRoles;
};
const getUserByParams = async params => {
  //Execution
  let users = await knex
    .select('*')
    .from('users')
    .where('users.firstName', params.firstName) // poner en upper el first name
    .andWhere('users.lastName', params.lastName) // poner en upper el last name
    .whereNot('users.id', params.userId);

  return users;
};

const getAccessCodeRevoked = async () => {
  //Execution
  let accessCodes = await knex
    .select(
      'accounts.id',
      'accounts.firstName',
      'accounts.lastName',
      'accessCodes.code',
      'accounts.email'
    )
    .from('accessCodes')
    .innerJoin('accounts', 'accounts.id', 'accessCodes.accountId')
    .where('accessCodes.status', 'revoked')
    .andWhere('accounts.status', 'unverified')
    .whereNull('accounts.userName')
    .whereNull('accounts.password')
    .limit(30); //remover el limite
  return accessCodes;
};

const getAccountByEmail = async email => {
  //Execution
  let accessCodes = await knex
    .select(
      'accounts.id',
      'accounts.firstName',
      'accounts.lastName',
      'accessCodes.code',
      'accounts.email',
      'accessCodes.status'
    )
    .from('accounts')
    .leftJoin('accessCodes', 'accessCodes.accountId', 'accounts.id')
    .where('accounts.email', email);
  return accessCodes;
};

const getAccountById = async id => {
  //Execution
  let account = await knex
    .select(
      'accounts.id',
      'accounts.firstName',
      'accounts.lastName',
      'accessCodes.code',
      'accounts.email',
      'accessCodes.status'
    )
    .from('accounts')
    .leftJoin('accessCodes', 'accessCodes.accountId', 'accounts.id')
    .where('accounts.id', id);
  return account;
};

const getUsers = () => {
  //if (!employerId) throw new Error('employerId is required');

  //Execution
  return knex
    .select(
      'user.id',
      'user.firstName',
      'user.middleName',
      'user.lastName',
      'user.email',
      'user.accountId'
      //'user_roles.*'
    )
    .from('users AS user');
};

const getEmployees = async data => {
  //Execution
  let employees = await knex
    .select('*')
    .from('employees')
    .where('employees.number', data.number)
    .where('employees.employerId', data.employerId);
  return employees;
};

module.exports = {
  userByAccountId,
  userById,
  getAccessCodeRevoked,
  userRolesByUserId,
  getUserByParams,
  getAccountByEmail,
  getUsers,
  getEmployees,
  getAccountById,
  userRolesEmployeeByUserId
};
