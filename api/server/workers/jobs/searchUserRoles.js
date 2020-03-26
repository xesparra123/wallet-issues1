let fs = require('fs');
let path = require('path');

const userRepository = require('../../repositories/users');
const { createProducer, getQueue } = require('../utils');

const queueName = 'SEARCH_USER_ROLES';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);
const searchEmployeeEntityWorker = require('./searchEmployees');

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const writeFile = async users => {
  let route = path.join(__dirname, 'Files/usersRoles.json');

  let json = JSON.stringify(users);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);

  await fs.writeFileSync(route, json, 'utf8');
};


const readFile = async () => {
  const route = path.join(__dirname, 'Files/users.json');
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let users = await readFile();

      for (let i = 0; i < users.length; i++) {
        let roles = await userRepository.userRolesEmployeeByUserId(users[i].id);

        users[i].user_roles = [];

        if (roles.length) users[i].user_roles = roles;

        console.log(
          `Searching roles.. i:${i} - total: ${users.length} - ${Math.round(
            ((i + 1) / users.length) * 100
          )}%`
        );

        job.progress(Math.round((i / users.length) * 100));
      }

      job.progress(100);


      await writeFile(users);
      searchEmployeeEntityWorker.addToQueue();

      done(null, { date: new Date() });
      //done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
