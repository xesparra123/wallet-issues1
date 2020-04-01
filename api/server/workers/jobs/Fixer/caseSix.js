// user con mas de un user rol y tienen employee/candidate en wallet, pero no tienen employees en HR

let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../../utils');

const queueName = 'USER_ROLES_WITH_EMPLOYEE_BUT_HR';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const {
  userWithRolesRefencesOnTablesButNotExitsReferenceOnHR
} = require('../../../processor/processor-v2');

const readFile = async () => {
  const route = path.join(__dirname, 'Files/userManyRolesButEmployeeHR.json');
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let users = await readFile();

      await userWithRolesRefencesOnTablesButNotExitsReferenceOnHR(users); //user con mas de un user rol y no tienen employees  en wallet

      done(null, { date: new Date() });
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
