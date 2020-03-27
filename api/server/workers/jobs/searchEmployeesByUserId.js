let fs = require('fs');
let path = require('path');

const employeeRepository = require('../../repositories/employees');
const { createProducer, getQueue } = require('../utils');

const queueName = 'SEARCH_EMPLOYEE_ENTITY_BY_USERID';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const searchCandidatesWorker = require('./searchCandidatesByUserId');

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const writeFile = async users => {
  let route = path.join(__dirname, 'Files/usersRolesWallet.json');

  let json = JSON.stringify(users);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);

  await fs.writeFileSync(route, json, 'utf8');
};

const readFile = async () => {
  const route = path.join(__dirname, 'Files/usersRoles.json');
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let users = await readFile();

      for (let i = 0; i < users.length; i++) {
        let employees = await employeeRepository.getEmployeesByUserId(
          users[i].id
        );

        users[i].employees = [];

        if (employees.length > 0) {
          users[i].employees = employees;
        }

        console.log(
          `Searching employees wallet.. i:${i} - total: ${
            users.length
          } -  ${Math.round(((i + 1) / users.length) * 100)}%`
        );
        job.progress(Math.round((i / users.length) * 100));
      }

      job.progress(100);
      await writeFile(users);
      searchCandidatesWorker.addToQueue();
      // console.log('finalizando users roles');
      done(null, { date: new Date() });
      //done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
