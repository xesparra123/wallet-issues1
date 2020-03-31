const moment = require('moment');

const userRolesRepository = require('../repositories/userRoles');
const employeeRepository = require('../repositories/employees');

// buscar los employees que estan repetidos un monton de veces en wallet
// buscar los employees que estan repetidos un monton de veces en HR ( activos )

const userWithOneRolRefencesOnTablesAndExitsReferenceOnHR = async data => {
  //user con 1 solo user rol y  tienen employee  en wallet y el employee existe en HR (esta bien)

  for (const user of data) {
    try {
      const employee = user.employees[0];
      const employeeHr = employee.employeeHr[0];
      const roleId = user.userRoles[0].id;
      const employeeId = employee.id;

      if (employeeHr.status === 0 && employee.active !== 0) {
        await employeeRepository.updateEmployeeStatus(employeeId, 0);
        await userRolesRepository.updateRoleStatus(roleId, 0);
      }

      if (employeeHr.status === 1 && employee.active !== 1) {
        await employeeRepository.updateEmployeeStatus(employeeId, 1);
        await userRolesRepository.updateRoleStatus(roleId, 1);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

const userWithRolesRefencesOnTablesAndExitsReferenceOnHR = async data => {
  //select one of them
  //search all of the user roles and references duplicated and delete all of them

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

  return data;
};

const userWithRolesButNotExitsReferenceOnTables = async data => {
  //delete user roles
  //create rol of wanderer for this user if the user doesn't have one

  for (const user of data) {
    try {
      user.userRoles.map(async role => {
        const roleId = role.id;
        const entity = role.cd_entity;

        if (entity !== 'wanderer') {
          await userRolesRepository.deleteUserRole(roleId, entity);
        } else {
          const wandererRole = await userRolesRepository.findUserRole(
            roleId,
            'wanderer'
          );

          if (!wandererRole) {
            const mappedRole = mapUserRole({
              status: 0,
              userId: user.id,
              cd_entity: 'wanderer'
            });

            await userRolesRepository.createUserRole(mappedRole);
            //update auth
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
};

const userWithOneRolRefencesOnTablesButNotExitsReferenceOnHR = async data => {
  //delete user role
  //delete table reference
  //create rol of wanderer for this user if the user doesn't have one

  for (const user of data) {
    try {
      await employeeRepository.deleteEmployeeByUserId(user.id);

      user.userRoles.map(async role => {
        const roleId = role.id;
        const entity = role.cd_entity;

        if (entity !== 'wanderer') {
          await userRolesRepository.deleteUserRole(roleId, entity);
        } else {
          const wandererRole = await userRolesRepository.findUserRole(
            roleId,
            'wanderer'
          );

          if (!wandererRole) {
            const mappedRole = mapUserRole({
              status: 0,
              userId: user.id,
              cd_entity: 'wanderer'
            });

            await userRolesRepository.createUserRole(mappedRole);
            //update auth
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  return data;
};

const userWithRolesRefencesOnTablesButNotExitsReferenceOnHR = async data => {
  //delete user roles
  //delete table reference
  //create rol of wanderer for this user if the user doesn't have one

  return data;
};

const usersWithoutUserRoles = async data => {
  //if they have employees or candidates attach, create a user rol for them... validate if is correct asociated or not

  return data;
};

const mapUserRole = userRole => {
  return {
    cd_entity: userRole.cd_entity,
    status: userRole.status,
    userId: userRole.userId,
    createdAt: moment().format('YYYY-MM-DD hh:mm:ss'),
    updatedAt: moment().format('YYYY-MM-DD hh:mm:ss')
  };
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
