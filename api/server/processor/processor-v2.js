// buscar los employees que estan repetidos un monton de veces en wallet
// buscar los employees que estan repetidos un monton de veces en HR ( activos )


const userWithOneRolRefencesOnTablesAndExitsReferenceOnHR = async (data) => {
  //they are ok
  return data;
};

const userWithRolesRefencesOnTablesAndExitsReferenceOnHR = async (data) => {
  //select one of them 
  //search all of the user roles and references duplicated and delete all of them 
  return data;
};

const userWithRolesRefencesOnTablesAndExitsReferenceOnHRInactive = async (data) => {
  //select one of them 
  //search all of the user roles and references duplicated and delete all of them 
  return data;
};

const userWithOneRolButNotExitsReferenceOnTables = async (data) => {
  //delete user role
  //create rol of wanderer for this user if the user doesn't have one
  return data;
};
  
const userWithRolesButNotExitsReferenceOnTables = async (data) => {
  //delete user roles
  //create rol of wanderer for this user if the user doesn't have one
  return data;
};

const userWithOneRolRefencesOnTablesButNotExitsReferenceOnHR = async (data) => {
  //delete user role
  //delete table reference
  //create rol of wanderer for this user if the user doesn't have one
  return data;
};

const userWithRolesRefencesOnTablesButNotExitsReferenceOnHR = async (data) => {
  //delete user roles
  //delete table reference
  //create rol of wanderer for this user if the user doesn't have one
  return data;
};

const usersWithoutUserRoles = async (data) => {
  //if they have employees or candidates attach, create a user rol for them... validate if is correct asociated or not 
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
