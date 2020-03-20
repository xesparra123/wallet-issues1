const employeeRepository = require('../../repositories/employees');
const { createProducer, getQueue } = require('../utils');

const queueName = 'SEARCH_EMPLOYEE_ENTITY';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const searchEmployeeHrWorker = require('./searchEmployeeHR');

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      const { set } = job.data;
      const { users } = set;

      for (let i = 0; i < users.length; i++) {
        for (let k = 0; k < users[i].user_roles.length; k++) {
          let employees = await employeeRepository.getEmployeeByEntityId(
            users[i].user_roles[k].id_entity
          );

          users[i].user_roles[k].employees = [];

          if (employees) {
            users[i].user_roles[k].employees = employees;
          }
        }
        console.log(
          `Searching employees wallet.. i:${i} - total: ${
            users.length
          } -  ${Math.round(((i + 1) / users.length) * 100)}%`
        );
        job.progress(Math.round((i / users.length) * 100));
      }

      job.progress(100);
      searchEmployeeHrWorker.addToQueue({ users });
      // console.log('finalizando users roles');
      done(null, { date: new Date() });
      //done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
