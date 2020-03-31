let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../../utils');

const queueName = 'USER_ONE_ROLE_WITH_EMPLOYEE_HR';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const {
  userWithOneRolRefencesOnTablesAndExitsReferenceOnHR
} = require('../../../processor/processor-v2');

const readFile = async () => {
  const route = path.join(
    __dirname,
    '../Files/userOneRoleWithEmployeeWithHR.json'
  );
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

      await userWithOneRolRefencesOnTablesAndExitsReferenceOnHR(users);

      done(null, { date: new Date() });
    } catch (error) {
      console.log(error);
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
