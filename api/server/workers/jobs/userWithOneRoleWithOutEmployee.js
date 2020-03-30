let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../utils');

const queueName = 'USER_ONE_ROLE_WITHOUT_EMPLOYEE';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const {
  userWithOneRolButNotExitsReferenceOnTables
} = require('../../processor/processor-v2');

const readFile = async () => {
  const route = path.join(__dirname, 'Files/usersRolesWalletHR.json');
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const writeResultFile = async filters => {
  let route = path.join(__dirname, 'Files/userWithOneRoleWithOutEmployee.json');

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

      console.log('userWithOneRoleWithOutEmployee... 25%');
      job.progress(25);

      const userWithOneRoleWithOutEmployee = await userWithOneRolButNotExitsReferenceOnTables(
        users
      );

      console.log('userWithOneRoleWithOutEmployee... 75%');
      job.progress(75);

      const result = [
        {
          type: 'userWithOneRoleWithOutEmployee',
          data: userWithOneRoleWithOutEmployee,
          count: userWithOneRoleWithOutEmployee.length
        }
      ];

      await writeResultFile(result);
      console.log('userWithOneRoleWithOutEmployee... 100%');

      job.progress(100);
      done(null, { date: new Date() });
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
