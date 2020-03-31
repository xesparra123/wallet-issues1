let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../../utils');

const queueName = 'USER_ROLES_WITHOUT_EMPLOYEE';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const {
  userWithRolesButNotExitsReferenceOnTables
} = require('../../../processor/processor-v2');

const readFile = async () => {
  const route = path.join(__dirname, 'Files/userManyRolesButEmployee.json');
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

      await userWithRolesButNotExitsReferenceOnTables(users);

      done(null, { date: new Date() });
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
