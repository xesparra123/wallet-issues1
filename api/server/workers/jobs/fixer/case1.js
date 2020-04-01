let fs = require('fs');
let path = require('path');

const authService = require('../../../services/auth');

const userRoleRepository = require('../../../repositories/userRoles');
const employeeRepository = require('../../../repositories/employees');
const candidateRepository = require('../../../repositories/candidates');

const ENTITY_TYPES = require('../../../constants');

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

      for (let [index, user] of users.entries()) {
        const employees = user.employees;
        const candidates = user.candidates;

        for (let employee of employees) {
          if (!employee.employeeHR) {
            await employeeRepository.delete();
            continue;
          }

          await employeeRepository.update(
            { active: employee.employeeHR.status },
            employee.id
          );
          await userRoleRepository.createUserRole({
            cd_entity: 'employee',
            id_entity: employee.id,
            userId: user.id,
            status: employee.employeeHR.status
          });
        }

        for (let candidate of candidates) {
          if (!candidate.candidatePrehire) {
            await candidateRepository.delete(candidate.id);
            continue;
          }

          let employee = employees.find(
            employee =>
              employee.employerId === candidate.candidatePrehire.employerId
          );

          if (!employee) {
            await userRoleRepository.createUserRole({
              cd_entity: 'applicant',
              id_entity: candidate.id,
              userId: user.id,
              status: candidate.candidateHR.status
            });
          }
        }

        if (employees.length + candidates.length === 0) {
          await authService.updateAccountRoles(user.accountId, {
            rolesToAdd: [ENTITY_TYPES.WANDERER],
            rolesToRemove: [ENTITY_TYPES.APPLICANT, ENTITY_TYPES.EMPLOYEE]
          });
        }

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
