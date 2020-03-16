const knex = require('../db');

const userByAccountId = async (accountId) => {
  //Validations
  if (!accountId) throw new Error('accountId is required');

  //Execution
  
  let user = await knex.select('*').from('users')
    .where('users.accountId', accountId);
  return user;
};

const userRolesByUserId = async (userId) => {
  //Validations
  if (!userId) throw new Error('userId is required');

  //Execution
  
  let userRoles = await knex.select('*').from('user_roles')
    .where('user_roles.userId', userId);
  
  return userRoles;
};

const getUserByParams = async (params) => {
  //Execution
  let users = await knex.select('*').from('users')
    .where('users.firstName', params.firstName) // poner en upper el first name
    .andWhere('users.lastName', params.lastName) // poner en upper el last name
    .whereNot('users.id', params.userId);
  
  return users;
};

const getAccessCodeRevoked = async () => {
  //Execution
  let accessCodes = await knex.select('accounts.id', 'accounts.firstName', 'accounts.lastName', 'accessCodes.code','accounts.email').from('accessCodes')
    .innerJoin('accounts', 'accounts.id', 'accessCodes.accountId')
    .where('accessCodes.status', 'revoked')
    .andWhere('accounts.status', 'unverified')
    .whereNull('accounts.userName')
    .whereNull('accounts.password').limit(2); //remover el limite
  return accessCodes; 
};

const getAccountByEmail = async (email) => {
  //Execution
  let accessCodes = await knex.select('accounts.id', 'accounts.firstName', 'accounts.lastName', 'accessCodes.code','accounts.email','accessCodes.status')
    .from('accounts')
    .leftJoin('accessCodes', 'accessCodes.accountId', 'accounts.id')
    .where('accounts.email', email); 
  return accessCodes; 
};

const getEmployeesDuplicated = async () => {
  //Execution
  let accessCodes = await knex.select('employees.number', 'employees.employerId', knex.raw(
    'COUNT(id) as total'
  ))
    .from('employees')
    .groupBy('employees.number', 'employees.employerId')
    .having('total','>','1'); 
  return accessCodes; 
};

module.exports = {
  userByAccountId,
  getAccessCodeRevoked,
  userRolesByUserId,
  getUserByParams,
  getAccountByEmail,
  getEmployeesDuplicated
};