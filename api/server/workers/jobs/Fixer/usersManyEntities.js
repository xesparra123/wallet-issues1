/*8. user con employee/candidate duplicado del mismo employer */

let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../../utils');

const queueName = 'USERS_MANY_ENTITIES_FIXER';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const {
  deleteUserRole,
  updateRoleStatus
} = require('../../../repositories/userRoles');

const { updateEmployeeStatus } = require('../../../repositories/employees');
const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const readFile = async () => {
  const route = path.join(__dirname, '/Files/caseEight.json');
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let data = await readFile();

      for (let i = 0; i < data.employeesToDelete.length; i++) {
        console.log('Eliminando employee..', data.employeesToDelete[i].id);
        //TODO: ELIMINAR EMPLOYEEE
      }

      job.progress(50);

      console.log('Case 8: 50%');

      for (let j = 0; j < data.rolesToDelete.length; j++) {
        console.log('Eliminando user role..', data.rolesToDelete[j].id);
        //TODO: ELIMINAR ROLE
      }

      job.progress(100);

      console.log('Case 8: 100%');

      job.progress(100);

      done(null, { date: new Date() });
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
