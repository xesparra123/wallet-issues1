let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../utils');

const queueName = 'FILTER_TYPES';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const {
  rolesBothFilter,
  rolesButHRFilter,
  oneRoleButEmployeesFilter
} = require('./../../processor/processor');

const writeResultFile = async filters => {
  let route = path.join(__dirname, 'Files/result.json');

  let json = JSON.stringify(filters);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);
  await fs.writeFileSync(route, json, 'utf8');

  let output = '';
  for (let i = 0; i < filters.length; i++) {
    for (let j = 0; j < filters[i].data.length; j++) {
      output += `${filters[i].data[j].id}, `;
      output += `${filters[i].data[j].firstName}, `;
      output += `${filters[i].data[j].middleName}, `;
      output += `${filters[i].data[j].lastName}, `;
      output += `${filters[i].data[j].email}, `;
      output += `${filters[i].data[j].accountId}, `;
      for (let k = 0; k < filters[i].data[j].user_roles.length; k++) {
        if (k > 0) {
          output += `${filters[i].data[j].id}, `;
          output += `${filters[i].data[j].firstName}, `;
          output += `${filters[i].data[j].middleName}, `;
          output += `${filters[i].data[j].lastName}, `;
          output += `${filters[i].data[j].email}, `;
          output += `${filters[i].data[j].accountId}, `;
        }
        output += `${filters[i].data[j].user_roles[k].id}, `;
        output += `${filters[i].data[j].user_roles[k].cd_entity}, `;
        output += `${filters[i].data[j].user_roles[k].status}, `;
        output += `${filters[i].data[j].user_roles[k].employerId}, `;

        if (!filters[i].data[j].user_roles[k].employees.length) {
          output += '\n';
        }

        for (
          let l = 0;
          l < filters[i].data[j].user_roles[k].employees.length;
          l++
        ) {

          if (l > 0) {
            output += `${filters[i].data[j].user_roles[k].id}, `;
            output += `${filters[i].data[j].user_roles[k].cd_entity}, `;
            output += `${filters[i].data[j].user_roles[k].status}, `;
            output += `${filters[i].data[j].user_roles[k].employerId}, `;

            if (!filters[i].data[j].user_roles[k].employees.length) {
              output += '\n';
            }
          }
          output += `${filters[i].data[j].user_roles[k].employees[l].id}, `;
          output += `${filters[i].data[j].user_roles[k].employees[l].firstName}, `;
          output += `${filters[i].data[j].user_roles[k].employees[l].middleName}, `;
          output += `${filters[i].data[j].user_roles[k].employees[l].lastName}, `;
          output += `${filters[i].data[j].user_roles[k].employees[l].number}, `;
          output += `${filters[i].data[j].user_roles[k].employees[l].email}, `;
          output += `${filters[i].data[j].user_roles[k].employees[l].active}, `;
          output += `${filters[i].data[j].user_roles[k].employees[l].evercheckId}, `;
          output += `${filters[i].data[j].user_roles[k].employees[l].employerId}`;
        }

        if (!filters[i].data[j].user_roles[k].employeeHr.length) {
          output += '\n';
        }

        for (
          let n = 0;
          n < filters[i].data[j].user_roles[k].employeeHr.length;
          n++
        ) {
          output += `${filters[i].data[j].user_roles[k].employeeHr[n].id}, `;
          output += `${filters[i].data[j].user_roles[k].employeeHr[n].firstName}, `;
          output += `${filters[i].data[j].user_roles[k].employeeHr[n].middleName}, `;
          output += `${filters[i].data[j].user_roles[k].employeeHr[n].lastName}, `;
          output += `${filters[i].data[j].user_roles[k].employeeHr[n].number}, `;
          output += `${filters[i].data[j].user_roles[k].employeeHr[n].email}, `;
          output += `${filters[i].data[j].user_roles[k].employeeHr[n].status}`;
          output += '\n';
        }
      }
    }

    console.log(`Files/${filters[i].type}.csv`);
    let route = path.join(__dirname, `Files/${filters[i].type}.csv`);
    await fs.writeFileSync(route, output, 'utf8');
  }
};
const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      const { set } = job.data;
      const { users } = set;

      const userWithoutRoles = users.filter(
        user => user.user_roles.length === 0
      ); //user sin user rol

      console.log('Filtering cases.. 14%');

      job.progress(14);
      const userWithOneRoleWithOutEmployee = users.filter(
        user =>
          user.user_roles.length === 1 &&
          user.user_roles[0].employees.length === 0
      ); //user con 1 solo user rol y no tienen employee  en wallet

      console.log('Filtering cases.. 28%');
      job.progress(28);

      const userWithEmployeeButHR = users.filter(
        user =>
          user.user_roles.length === 1 &&
          user.user_roles[0].employees.length === 1 &&
          user.user_roles[0].employeeHr.length == 0
      ); //user con 1 solo user rol y  tienen employee  en wallet , pero el employee no existe en HR

      console.log('Filtering cases.. 42%');
      job.progress(42);

      const userWithEmployeeWithHR = users.filter(
        user =>
          user.user_roles.length === 1 &&
          user.user_roles[0].employees.length === 1 &&
          user.user_roles[0].employeeHr.length == 1
      ); //user con 1 solo user rol y  tienen employee  en wallet y el employee existe en HR (esta bien)

      console.log('Filtering cases.. 56%');
      job.progress(56);

      const oneRoleButEmployees = oneRoleButEmployeesFilter(users); //user con mas de un user rol y no tienen employees  en wallet

      console.log('Filtering cases.. 70%');
      job.progress(70);

      const rolesButHR = rolesButHRFilter(users); //user con mas de un user rol y no tienen employees  en wallet
      console.log('Filtering cases.. 84%');
      job.progress(84);

      const rolesBoth = rolesBothFilter(users); //user con mas de un user rol y  tienen employees  en wallet , y tienen employees en HR

      const result = [
        {
          type: 'userWithoutRoles',
          data: userWithoutRoles,
          count: userWithoutRoles.length
        },
        {
          type: 'userWithOneRoleWithOutEmployee',
          data: userWithOneRoleWithOutEmployee,
          count: userWithOneRoleWithOutEmployee.length
        },
        {
          type: 'userWithEmployeeButHR',
          data: userWithEmployeeButHR,
          count: userWithEmployeeButHR.length
        },
        {
          type: 'userWithEmployeeWithHR',
          data: userWithEmployeeWithHR,
          count: userWithEmployeeWithHR.length
        },
        {
          type: 'oneRoleButEmployees',
          data: oneRoleButEmployees,
          count: oneRoleButEmployees.length
        },
        {
          type: 'rolesButHR',
          data: rolesButHR,
          count: rolesButHR.length
        },
        {
          type: 'rolesBoth',
          data: rolesBoth,
          count: rolesBoth.length
        }
      ];

      await writeResultFile(result);
      console.log('Filtering cases.. 100%');
      job.progress(100);
      // console.log('finalizando users roles');
      done(null, { date: new Date(), result });
      //done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
