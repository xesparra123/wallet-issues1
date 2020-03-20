let fs = require('fs');
const userRepository = require('../repositories/users');
const validateAccount = require('../workers/jobs/validateAccount');
let path = require('path');

const createItemsToValidateOnWallet = async path => {
  //try {

  let fileStream = await fs.readFileSync(path, 'utf8');
  let accounts = JSON.parse(fileStream);

  for (let account of accounts) {
    //TODO: CALL WORKER TO VALIDATE ACCOUNT

    console.log('account', account);
    await validateAccount.addToQueue(account);
  }
  // } catch (error) {
  //   console.log('error on createItemsToValidateOnWallet', error);
  // }
};

const accountToValidateOnWallet = async account => {
  try {
    console.log('account', account);
    let users = await userRepository.userByAccountId(account.id);

    if (users.length === 0) console.log('account not associate to any user');
    for (let user of users) {
      //crear un archivo donde ponga si el user exist o no , de existir decir si hay algun campo que no coincide.
      if (account.firstName.toUpperCase() !== user.firstName.toUpperCase())
        console.log('firstName not match');
      if (account.lastName.toUpperCase() !== user.lastName.toUpperCase())
        console.log('lastName not match');
      if (account.email.toUpperCase() !== user.email.toUpperCase())
        console.log('email not match');
      //add user roles
      let userWithRoles = await addUserRolesToUser(user);
      let userWithHisMatch = await searchMatchUsers(userWithRoles);
      // crear un documento nuevo con userWithHisMatch
      console.log(userWithHisMatch);
    }
  } catch (error) {
    console.log('error on accountToValidateOnWallet', error);
  }
};

const addUserRolesToUser = async user => {
  try {
    let userRoles = await userRepository.userRolesByUserId(user.id);
    user.userRoles = userRoles;
    return user;
  } catch (error) {
    console.log('error on addUserRolesToUser', error);
  }
};

const searchMatchUsers = async user => {
  try {
    //add others users with the same firtName and lastName
    let params = {
      firstName: user.firstName.toUpperCase(),
      lastName: user.lastName.toUpperCase(),
      userId: user.id
    };
    user.matchUsers = [];
    let matchUsers = await userRepository.getUserByParams(params);
    for (const item of matchUsers) {
      let itemWithRoles = await addUserRolesToUser(item);
      let addAuthAccount = await userRepository.getAccountByEmail(
        item.email.toUpperCase().trim()
      );
      itemWithRoles.authAccount = addAuthAccount;
      console.log('itemWithRoles', itemWithRoles);
      user.matchUsers.push(itemWithRoles);
    }
    return user;
  } catch (error) {
    console.log('error on searchMatchUsers', error);
  }
};

const searchEmployeesDuplicates = async path => {
  try {
    let fileStream = await fs.readFileSync(path, 'utf8');
    let dataToSearch = JSON.parse(fileStream);
    for (let data of dataToSearch) {
      await employeesToSearch(data);
    }
  } catch (error) {
    console.log('error on searchEmployeesDuplicates', error);
  }
};

const employeesToSearch = async data => {
  try {
    let employees = await userRepository.getEmployees(data);
    for (let employee of employees) {
      await searchUserByEmployee(employee);
    }
  } catch (error) {
    console.log('error on employeesToSearch', error);
  }
};

const searchUserByEmployee = async employee => {
  try {
    if (!employee.userId) {
      console.log('employee not have userId associate', employee);
    } else {
      employee.users = await userRepository.userById(employee.userId);
    }

    if (employee.users && employee.users.length && employee.users.length > 1) {
      //remove employees duplicate y dejar solo el que tenga userId o el que coincida con la data del user
      console.log('many users', employee.users);
    } else {
      //validate employee on HR (number, employerId, firstName, LastName)
      console.log('one user', employee.users);
    }
    //remove the user roles and add new user roles del employer
    for (const user of employee.users) {
      let userWithRoles = await addUserRolesToUser(user);
      console.log(userWithRoles);
    }
  } catch (error) {
    console.log('error on searchUserByEmployee', error);
  }
};

const createOrUpdateReportFile = async (type, data) => {
  try {
    let dataToAppend = '';
    switch (type) {
      case 'employeesDuplicateOnWalletAndHR':
        {
          for (const user of data.users) {
            dataToAppend += `${user.firstName},`;
            dataToAppend += `${user.lastName},`;
            dataToAppend += `${user.email},`;
            dataToAppend += `${user.accountId},`;

            let employersAffected = '';
            let typeOfAccounts = '';
            let employeesNumbers = '';
            for (const userRole of user.user_roles) {
              if (!employersAffected.includes(userRole.employerId)) {
                employersAffected = `${userRole.employerId}-`;
              }
              if (!typeOfAccounts.includes(userRole.cd_entity)) {
                typeOfAccounts = `${userRole.cd_entity}-`;
              }
              //buscar el Id de wallet del employee y el number
              for (const employee of userRole.employees) {
                if (
                  employeesNumbers &&
                  !employeesNumbers.includes(employee.number)
                ) {
                  employeesNumbers = `${employee.number}-`;
                }
              }
            }
            dataToAppend += `${employersAffected},`;
            dataToAppend += `${typeOfAccounts},`;
            dataToAppend += `${employeesNumbers} \n`;
          }
          await buildFile(type, dataToAppend);
        }
        break;

      default:
        break;
    }
    console.log(dataToAppend);
  } catch (error) {
    console.log('error on createOrUpdateReportFile', error);
  }
};

const buildFile = async (type, data) => {
  let route = path.join(__dirname, `Files/${type}.csv`);
  //validate if the file exist, I replace the file always
  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.appendFileSync(route, data, 'utf8');
  else await fs.writeFileSync(route, data, 'utf8');
};

const oneRoleButEmployeesFilter = users => {
  //user con mas de un user rol y   no tienen employees  en wallet
  const usersMoreThanOneRole = users.filter(user => user.user_roles.length > 1);

  const usersWithOutEmployee = [];
  for (let i = 0; i < usersMoreThanOneRole.length; i++) {
    const user_roles = usersMoreThanOneRole[i].user_roles.filter(
      user_roles => user_roles.employees.length === 0
    );

    if (user_roles.length > 0)
      usersWithOutEmployee.push(usersMoreThanOneRole[i]);
  }

  return usersWithOutEmployee;
};

const rolesButHRFilter = users => {
  //user con mas de un user rol y  tienen employees  en wallet , pero no tienen employees en HR
  const usersMoreThanOneRole = users.filter(user => user.user_roles.length > 1);

  const usersWithOutHR = [];
  for (let i = 0; i < usersMoreThanOneRole.length; i++) {
    const user_roles = usersMoreThanOneRole[i].user_roles.filter(
      user_roles =>
        user_roles.employees.length === 1 && user_roles.employeeHr.length == 0
    );

    if (user_roles.length > 0) usersWithOutHR.push(usersMoreThanOneRole[i]);
  }

  return usersWithOutHR;
};

const rolesBothFilter = users => {
  //user con mas de un user rol y tienen employees  en wallet y tienen employees en HR
  const usersMoreThanOneRole = users.filter(user => user.user_roles.length > 1);

  const usersWithBoth = [];
  for (let i = 0; i < usersMoreThanOneRole.length; i++) {
    const user_roles = usersMoreThanOneRole[i].user_roles.filter(
      user_roles =>
        user_roles.employees.length === 1 && user_roles.employeeHr.length == 1
    );

    if (user_roles.length > 0) usersWithBoth.push(usersMoreThanOneRole[i]);
  }

  return usersWithBoth;
};

const filterUsersByType = async users => {
  const userWithoutRoles = users.filter(user => user.user_roles.length === 0); //user sin user rol

  const userWithOneRoleWithOutEmployee = users.filter(
    user =>
      user.user_roles.length === 1 && user.user_roles[0].employees.length === 0
  ); //user con 1 solo user rol y no tienen employee  en wallet

  const userWithEmployeeButHR = users.filter(
    user =>
      user.user_roles.length === 1 &&
      user.user_roles[0].employees.length === 1 &&
      user.user_roles[0].employeeHr.length == 0
  ); //user con 1 solo user rol y  tienen employee  en wallet , pero el employee no existe en HR

  const userWithEmployeeWithHR = users.filter(
    user =>
      user.user_roles.length === 1 &&
      user.user_roles[0].employees.length === 1 &&
      user.user_roles[0].employeeHr.length == 1
  ); //user con 1 solo user rol y  tienen employee  en wallet y el employee existe en HR (esta bien)

  const oneRoleButEmployees = oneRoleButEmployeesFilter(users); //user con mas de un user rol y no tienen employees  en wallet

  const rolesButHR = rolesButHRFilter(users); //user con mas de un user rol y no tienen employees  en wallet

  const rolesBoth = rolesBothFilter(users);
  return [
    {
      type: 'userWithoutRoles',
      userWithoutRoles
    },
    {
      type: 'userWithOneRoleWithOutEmployee',
      userWithOneRoleWithOutEmployee
    },
    {
      type: 'userWithEmployeeButHR',
      userWithEmployeeButHR
    },
    {
      type: 'userWithEmployeeWithHR',
      userWithEmployeeWithHR
    },
    {
      type: 'oneRoleButEmployees',
      oneRoleButEmployees
    },
    {
      type: 'rolesButHR',
      rolesButHR
    },
    {
      type: 'rolesBoth',
      rolesBoth
    }
  ];
};

module.exports = {
  createItemsToValidateOnWallet,
  accountToValidateOnWallet,
  searchEmployeesDuplicates,
  createOrUpdateReportFile,
  filterUsersByType,
  rolesBothFilter,
  rolesButHRFilter,
  oneRoleButEmployeesFilter
};
