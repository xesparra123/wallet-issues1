const _ = require('lodash');

const filterCaseOne = users => {
  return users.filter(user => user.userRoles.length === 0);
};

const filterCaseTwo = users => {
  let filteredUsers = users.filter(user => user.userRoles.length === 1);

  return filteredUsers.filter(
    user => user.candidate.length + user.employee.length === 0
  );
};

const filterCaseThree = users => {
  let filteredUsers = users.filter(user => user.userRoles.length === 1);

  return filteredUsers.filter();
};

const filterCaseSeven = users => {
  let result = {
    rolesToUpdate: [],
    rolesToDelete: [],
    employeesToUpdate: []
  };

  for (let i = 0; i < users.length; i++) {
    const employeeRoles = users[i].userRoles.filter(
      role => role.cd_entity === 'employee'
    );

    for (let j = 0; j < employeeRoles.length; j++) {
      let found = false;
      for (let k = 0; k < users[i].employees.length; k++) {
        if (employeeRoles[j].id === users[i].employees[k].user_role.id) {
          found = true;

          if (users[i].employees[k].employeeHr.length > 0) {
            if (
              users[i].employees[k].employeeHr[0].status !==
                users[i].employees[k].active ||
              users[i].employees[k].employeeHr[0].status !==
                users[i].employees[k].user_role.status
            ) {
              result.rolesToUpdate.push({
                id: users[i].employees[k].user_role.id,
                status: users[i].employees[k].employeeHr[0].status
              });

              result.employeesToUpdate.push({
                id: users[i].employees[k].id,
                status: users[i].employees[k].employeeHr[0].status
              });
            }
          }
        }
      }

      if (!found) result.rolesToDelete.push(employeeRoles[j]);
    }
  }
  return result;
};

const filterCaseEight = users => {
  let result = {
    employeesToDelete: [],
    rolesToDelete: []
  };
  for (let i = 0; i < users.length; i++) {
    console.log(
      `user: ${users[i].id} - employees: ${users[i].employees.length}`
    );

    let data = users[i].employees;
    let employeesByNumber = _.chain(data)
      .groupBy('number')
      .toPairs()
      .map(function(currentItem) {
        return _.zipObject(['number', 'employees'], currentItem);
      })
      .value();
    console.log('employeesByNumber', employeesByNumber);
    for (let k = 0; k < employeesByNumber.length; k++) {
      for (let j = 0; j < employeesByNumber[k].employees.length; j++) {
        let foundActive = false;
        if (employeesByNumber[k].employees[j].active === 1) {
          foundActive = true;
          for (let l = 0; l < employeesByNumber[k].employees.length; l++) {
            if (j !== l) {
              result.employeesToDelete.push({
                id: employeesByNumber[k].employees[l].id
              });
              result.rolesToDelete.push({
                id: employeesByNumber[k].employees[l].user_role.id
              });
            }
          }
          j = employeesByNumber[k].employees.length;
        }

        if (!foundActive) {
          for (let l = 0; l < employeesByNumber[k].employees.length; l++) {
            if (l !== 0) {
              result.employeesToDelete.push({
                id: employeesByNumber[k].employees[l].id
              });
              result.rolesToDelete.push({
                id: employeesByNumber[k].employees[l].user_role.id
              });
            }
          }
        }
      }
    }
  }

  console.log('result', result);
  return result;
};

module.exports = {
  filterCaseOne,
  filterCaseTwo,
  filterCaseThree,
  filterCaseSeven,
  filterCaseEight
};
