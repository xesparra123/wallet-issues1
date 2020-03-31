/* filtrando informacion de los casos*/

let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../../utils');

const queueName = 'FILTERS_FIXER';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const userOneRoleWithEmployeeWithHRJob = require('./userOneRoleWithEmployeeWithHRF');
const userManyRolesButEmployeeJob = require('./userManyRolesButEmployee');
const userManyRolesButEmployeesHRJob = require('./userManyRolesButEmployeesHR');

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const readFile = async () => {
  const route = path.join(
    __dirname,
    '../Files/usersEmployeesHRCandidatesPrehireRoles.json'
  );
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const writeFile = async (users, fileName) => {
  let route = path.join(__dirname, `../Files/${fileName}.json`);

  let json = JSON.stringify(users);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);

  await fs.writeFileSync(route, json, 'utf8');
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let users = await readFile();

      const userWithoutRoles = users.filter(
        user => user.user_roles.length === 0
      ); //user sin user rol

      await writeFile(userWithoutRoles, 'userWithoutRoles');
      console.log('Filtering cases... 10%');

      job.progress(10);

      const userOneRoleWithEmployeeWithHR = users.filter(user => {
        user.userRoles.length === 1 &&
          user.employees.length === 1 &&
          user.employees[0].employeeHr.length === 1;
      });

      await writeFile(
        userOneRoleWithEmployeeWithHR,
        'userOneRoleWithEmployeeWithHR'
      );

      userOneRoleWithEmployeeWithHRJob.addToQueue();
      console.log('Filtering cases... 20%');

      const userManyRolesButEmployee = users.filter(user => {
        user.userRoles.length > 1 &&
          (user.employees.length === 0 || user.candidates.length === 0);
      });

      await writeFile(userManyRolesButEmployee, 'userManyRolesButEmployee');

      userManyRolesButEmployeeJob.addToQueue();
      console.log('Filtering cases... 30%');

      const userManyRolesButEmployeeHR = users.filter(user => {
        user.userRoles.length > 1 &&
          user.employees.length === 1 &&
          user.employees[0].employeeHr.length === 0;
      });

      await writeFile(userManyRolesButEmployeeHR, 'userManyRolesButEmployeeHR');

      userManyRolesButEmployeesHRJob.addToQueue();
      console.log('Filtering cases... 40%');

      //AQUI DEBEN IR PONIENDO LOS DEMAS FILTROS

      job.progress(100);

      console.log('FINALIZANDO FILTER...');
      done(null, { date: new Date() });
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
