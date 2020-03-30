let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../utils');

const queueName = 'USER_ROLES_WITH_EMPLOYEE_WITH_HR';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const {
  userWithRolesRefencesOnTablesAndExitsReferenceOnHR
} = require('./../../processor/processor-v2');

const readFile = async () => {
  const route = path.join(__dirname, 'Files/usersRolesWalletHR.json');
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const writeResultFile = async filters => {
  let route = path.join(
    __dirname,
    'Files/userManyRolesWithEmployeeWithHR.json'
  );

  let json = JSON.stringify(filters);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);
  await fs.writeFileSync(route, json, 'utf8');
};

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let users = await readFile();

      console.log('userManyRolesWithEmployeeWithHR... 25%');
      job.progress(25);

      const userManyRolesWithEmployeeWithHR = await userWithRolesRefencesOnTablesAndExitsReferenceOnHR(
        users
      );

      console.log('userManyRolesWithEmployeeWithHR... 75%');
      job.progress(75);

      const result = [
        {
          type: 'userManyRolesWithEmployeeWithHR',
          data: userManyRolesWithEmployeeWithHR,
          count: userManyRolesWithEmployeeWithHR.length
        }
      ];

      await writeResultFile(result);
      console.log('userManyRolesWithEmployeeWithHR... 100%');

      job.progress(100);
      done(null, { date: new Date() });
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
