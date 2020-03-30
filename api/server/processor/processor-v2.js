const {
  oneRoleButEmployeesFilter,
  rolesButHRFilter,
  rolesBothFilter
} = require('./processor');

// buscar los employees que estan repetidos un monton de veces en wallet
// buscar los employees que estan repetidos un monton de veces en HR ( activos )

const userWithOneRolRefencesOnTablesAndExitsReferenceOnHR = async data => {
  //they are ok

  const userOneRoleWithEmployeeWithHR = data.filter(
    user =>
      user.user_roles.length === 1 &&
      user.user_roles[0].employees.length === 1 &&
      user.user_roles[0].employeeHr.length == 1
  ); //user con 1 solo user rol y  tienen employee  en wallet y el employee existe en HR (esta bien)

  return data;
};

const userWithRolesRefencesOnTablesAndExitsReferenceOnHR = async data => {
  //select one of them
  //search all of the user roles and references duplicated and delete all of them

  const userManyRolesWithEmployeeWithHR = rolesBothFilter(data); //user con mas de un user rol y  tienen employees  en wallet , y tienen employees en HR

  return data;
};

const userWithRolesRefencesOnTablesAndExitsReferenceOnHRInactive = async data => {
  //select one of them
  //search all of the user roles and references duplicated and delete all of them
  return data;
};

const userWithOneRolButNotExitsReferenceOnTables = async data => {
  //delete user role
  //create rol of wanderer for this user if the user doesn't have one

  const userWithOneRoleWithOutEmployee = data.filter(
    user =>
      user.user_roles.length === 1 && user.user_roles[0].employees.length === 0
  ); //user con 1 solo user rol y no tienen employee  en wallet

  return data;
};

const userWithRolesButNotExitsReferenceOnTables = async data => {
  //delete user roles
  //create rol of wanderer for this user if the user doesn't have one

  const userManyRolesButEmployees = oneRoleButEmployeesFilter(data); //user con mas de un user rol y no tienen employees  en wallet

  return data;
};

const userWithOneRolRefencesOnTablesButNotExitsReferenceOnHR = async data => {
  //delete user role
  //delete table reference
  //create rol of wanderer for this user if the user doesn't have one

  const userOneRoleWithEmployeeButHR = data.filter(
    user =>
      user.user_roles.length === 1 &&
      user.user_roles[0].employees.length === 1 &&
      user.user_roles[0].employeeHr.length == 0
  ); //user con 1 solo user rol y  tienen employee  en wallet , pero el employee no existe en HR

  return data;
};

const userWithRolesRefencesOnTablesButNotExitsReferenceOnHR = async data => {
  //delete user roles
  //delete table reference
  //create rol of wanderer for this user if the user doesn't have one

  const userManyRolesButEmployeesHR = rolesButHRFilter(data); //user con mas de un user rol y no tienen employees  en wallet

  return data;
};

const usersWithoutUserRoles = async data => {
  //if they have employees or candidates attach, create a user rol for them... validate if is correct asociated or not

  const userWithoutRoles = data.filter(user => user.user_roles.length === 0); //user sin user rol

  const userWithEmployeeOrCandidate = userWithoutRoles.filter(
    user => user.employees.length || user.candidates.length
  );

  for (const user of userWithEmployeeOrCandidate) {
    //create a user role for each user
  }

  return data;
};

module.exports = {
  userWithRolesRefencesOnTablesAndExitsReferenceOnHRInactive,
  userWithOneRolRefencesOnTablesAndExitsReferenceOnHR,
  userWithOneRolButNotExitsReferenceOnTables,
  userWithRolesButNotExitsReferenceOnTables,
  userWithOneRolRefencesOnTablesButNotExitsReferenceOnHR,
  userWithRolesRefencesOnTablesButNotExitsReferenceOnHR,
  userWithRolesRefencesOnTablesAndExitsReferenceOnHR,
  usersWithoutUserRoles
};
