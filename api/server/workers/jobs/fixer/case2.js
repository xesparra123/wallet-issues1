let fs = require('fs');
let path = require('path');

const authService = require('../../../services/auth');

const userRoleRepository = require('../../../repositories/userRoles');

const ENTITY_TYPES = require('../../../constants');

const { createProducer, getQueue } = require('../../utils');

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
  const route = path.join(__dirname, 'Files/caseTwo.json');
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

/*
2. user con 1 solo user rol y no tienen employee/candidate en wallet (userWithOneRoleWithOutEmployee)
    * delete user role
    * create rol of wanderer for this user if the user doesn't have one, actualizar el rol en el auth
*/

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let users = await readFile();

      for (let [index, user] of users.entries()) {
        let roles = user.userRoles;

        for (let role of roles) {
          await userRoleRepository.deleteUserRole(role.id, role.cd_entity);
        }

        await authService.updateAccountRoles(user.accountId, {
          rolesToAdd: [ENTITY_TYPES.WANDERER],
          rolesToRemove: [ENTITY_TYPES.APPLICANT, ENTITY_TYPES.EMPLOYEE]
        });

        await userRoleRepository.createUserRole({
          cd_entity: 'wanderer',
          userId: user.id,
          status: true
        });

        job.progress(Math.round((index / users.length) * 100));
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
