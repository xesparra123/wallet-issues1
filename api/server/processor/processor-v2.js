// buscar los employees que estan repetidos un monton de veces en wallet
// buscar los employees que estan repetidos un monton de veces en HR ( activos )

const moment = require('moment');
const path = require('path');
const fs = require('fs');

const userRolesRepository = require('../repositories/userRoles');
const employeeRepository = require('../repositories/employees');
// const authService = require('../../../services/auth');
// const ENTITY_TYPES = require('../../../constants');

const userWithOneRolRefencesOnTablesAndExitsReferenceOnHR = async data => {
  //user con 1 solo user rol y  tienen employee  en wallet y el employee existe en HR (esta bien)

  try {
    let employeeCount = 0,
      employeeActiveCount = 0,
      employeeInactiveCount = 0;

    for (const user of data) {
      try {
        const employee = user.employees[0];
        const employeeHr = employee.employeeHr[0];
        const roleId = user.userRoles[0].id;
        const employeeId = employee.id;

        if (employeeHr.status === 0 && employee.active !== 0) {
          await employeeRepository.updateEmployeeStatus(employeeId, false);
          await userRolesRepository.updateRoleStatus(roleId, false);

          employeeCount++;
          employeeInactiveCount++;
        }

        if (employeeHr.status === 1 && employee.active !== 1) {
          await employeeRepository.updateEmployeeStatus(employeeId, true);
          await userRolesRepository.updateRoleStatus(roleId, true);

          employeeCount++;
          employeeActiveCount++;
        }
      } catch (error) {
        console.log(error);
      }
    }

    const report = {
      case: 4,
      name: 'userOneRoleWithEmployeeWithHR',
      employeesUpdated: employeeCount,
      employeesActivated: employeeActiveCount,
      employeesInactivated: employeeInactiveCount
    };

    await writeResultFile(report, 'caseFour');
    console.log('Case 4 done');
  } catch (error) {
    console.log(error);
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

  try {
    let userRoleDeleted = 0,
      wandererCreated = 0,
      emloyeesCount = 0,
      actionFlag = false;

    for (const user of data) {
      try {
        const wandererEntity = 'wanderer';
        const userId = user.id;

        for (const role of user.userRoles) {
          try {
            const roleId = role.id;
            const entity = role.cd_entity;

            if (entity !== wandererEntity) {
              await userRolesRepository.deleteUserRole(roleId, entity);
              userRoleDeleted++;
              actionFlag = true;
            }
          } catch (error) {
            console.log(error);
          }
        }

        const wandererRole = await userRolesRepository.findUserRole(
          wandererEntity,
          userId
        );

        if (!wandererRole) {
          const mappedRole = mapUserRole({
            status: true,
            userId,
            cd_entity: wandererEntity
          });

          await userRolesRepository.createUserRole(mappedRole);
          wandererCreated++;
          actionFlag = true;
        }

        // uncomment when authservice is available
        // await authService.updateAccountRoles(user.accountId, {
        //   rolesToAdd: [ENTITY_TYPES.WANDERER],
        //   rolesToRemove: [ENTITY_TYPES.APPLICANT, ENTITY_TYPES.EMPLOYEE]
        // });

        actionFlag ? emloyeesCount++ : '';
      } catch (error) {
        console.log(error);
      }
    }

    const report = {
      case: 5,
      name: 'userManyRolesButEmployees',
      employeesTaken: emloyeesCount,
      rolesDeleted: userRoleDeleted,
      wanderersCreated: wandererCreated
    };

    await writeResultFile(report, 'caseFive');
    console.log('Case 5 done');
  } catch (error) {
    console.log(error);
  }
};

const userWithOneRolRefencesOnTablesButNotExitsReferenceOnHR = async data => {
  //delete user role
  //delete table reference
  //create rol of wanderer for this user if the user doesn't have one

  return data;
};

const userWithRolesRefencesOnTablesButNotExitsReferenceOnHR = async data => {
  //delete user roles
  //delete table reference
  //create rol of wanderer for this user if the user doesn't have one
  try {
    let userRoleDeleted = 0,
      wandererCreated = 0,
      employeesDeleted = 0;

    for (const user of data) {
      try {
        const wandererEntity = 'wanderer';
        const userId = user.id;
        const employeeId = user.employees[0].id;

        for (const role of user.userRoles) {
          try {
            const roleId = role.id;
            const entity = role.cd_entity;

            if (entity !== wandererEntity) {
              await userRolesRepository.deleteUserRole(roleId, entity);
              userRoleDeleted++;
            }
          } catch (error) {
            console.log(error);
          }
        }

        await employeeRepository.deleteEmployeeById(employeeId);
        employeesDeleted++;

        const wandererRole = await userRolesRepository.findUserRole(
          wandererEntity,
          userId
        );

        if (!wandererRole) {
          const mappedRole = mapUserRole({
            status: true,
            userId,
            cd_entity: wandererEntity
          });

          await userRolesRepository.createUserRole(mappedRole);
          wandererCreated++;
        }

        // uncomment when authservice is available
        // await authService.updateAccountRoles(user.accountId, {
        //   rolesToAdd: [ENTITY_TYPES.WANDERER],
        //   rolesToRemove: [ENTITY_TYPES.APPLICANT, ENTITY_TYPES.EMPLOYEE]
        // });
      } catch (error) {
        console.log(error);
      }
    }

    const report = {
      case: 6,
      name: 'userManyRolesButEmployeeHR',
      employeesDeleted: employeesDeleted,
      rolesDeleted: userRoleDeleted,
      wandererCreated: wandererCreated
    };

    await writeResultFile(report, 'caseSix');
    console.log('Case 6 done');
  } catch (error) {
    console.log(error);
  }
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

const writeResultFile = async (data, fileName) => {
  let route = path.join(
    __dirname,
    `../workers/jobs/Fixer/Reports/${fileName}.json`
  );

  let json = JSON.stringify(data);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);
  await fs.writeFileSync(route, json, 'utf8');
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
