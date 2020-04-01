let fs = require('fs');
let path = require('path');

const userRepository = require('../../repositories/users');
const { createProducer, getQueue } = require('../utils');

const queueName = 'SEARCH_USER_ROLES';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const writeFile = async users => {
  let route = path.join(
    __dirname,
    'Files/usersEmployeesHRCandidatesPrehireRoles.json'
  );

  let json = JSON.stringify(users);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);

  await fs.writeFileSync(route, json, 'utf8');
};

const readFile = async () => {
  const route = path.join(
    __dirname,
    'Files/usersEmployeesHRCandidatesPrehire.json'
  );
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let users = await readFile();

      for (let i = 0; i < users.length; i++) {
        let roles = await userRepository.userRolesByUserId(users[i].id);

        users[i].userRoles = [];
        users[i].orphanRoles = [];
        users[i].wandererRole = null;

        if (roles.length) {
          users[i].userRoles = roles;
          for (let j = 0; j < roles.length; j++) {
            if (roles[j].cd_entity === 'employee') {
              const index = users[i].employees.findIndex(
                employee => employee.id === roles[j].id_entity
              );

              if (index > -1) {
                users[i].employees[index].user_role = roles[j];
              } else {
                users[i].orphanRoles.push(roles[j]);
              }
            } else if (roles[j].cd_entity === 'applicant') {
              const index = users[i].candidates.findIndex(
                candidate => candidate.id === roles[j].id_entity
              );

              if (index > -1) {
                users[i].candidates[index].user_role = roles[j];
              } else {
                users[i].orphanRoles.push(roles[j]);
              }
            } else if (roles[j].cd_entity === 'wanderer') {
              users[i].wandererRole = roles[j];
            }
          }
        }

        console.log(
          `Searching roles.. i:${i} - total: ${users.length} - ${Math.round(
            ((i + 1) / users.length) * 100
          )}%`
        );

        job.progress(Math.round((i / users.length) * 100));
      }

      job.progress(100);

      await writeFile(users);

      done(null, { date: new Date() });
      //done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
