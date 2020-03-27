let fs = require('fs');
let path = require('path');

const evercheckRepository = require('../../repositories/evercheck');
const { createProducer, getQueue } = require('../utils');
const helper = require('../../repositories/evercheck/helper');

const queueName = 'SEARCH_EMPLOYEE_HR';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const searchCandidatesByUserIdWorker = require('./searchCandidatesByUserId');

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const writeFile = async users => {
  let route = path.join(__dirname, 'Files/usersEmployeesHR.json');

  let json = JSON.stringify(users);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);

  await fs.writeFileSync(route, json, 'utf8');
};

const readFile = async () => {
  const route = path.join(__dirname, 'Files/usersEmployees.json');
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let users = await readFile();

      for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < users[i].user_roles.length; j++) {
          let number = users[i].employees[j].number;
          let employerId = users[i].employees[j].employerId;

          let raw = await evercheckRepository.getEmployeeHr(number, employerId);

          users[i].employeeHr = [];

          if (raw.length) {
            let employeeHr = helper.mapToEmployee(raw);

            users[i].employees[j].employeeHr = employeeHr;
          }
        }
        console.log(
          `Searching employees HR.. i:${i} - total: ${
            users.length
          } - ${Math.round(((i + 1) / users.length) * 100)}%`
        );
        job.progress(Math.round((i / users.length) * 100));
      }

      job.progress(100);
      await writeFile(users);
      searchCandidatesByUserIdWorker.addToQueue();
      // console.log('finalizando users roles');
      done(null, { date: new Date() });
      //done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
