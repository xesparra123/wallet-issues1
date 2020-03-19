const evercheckRepository = require('../../repositories/evercheck');
const { createProducer, getQueue } = require('../utils');
const helper = require('../../repositories/evercheck/helper');

const queueName = 'SEARCH_EMPLOYEE_HR';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      const { set } = job.data;
      const { users } = set;

      for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < users[i].user_roles.length; j++) {
          for (let k = 0; k < users[i].user_roles[j].employees.length; k++) {
            let number = users[i].user_roles[j].employees[k].number;
            let employerId = users[i].user_roles[j].employees[k].employerId;

            let raw = await evercheckRepository.getEmployeeHr(
              number,
              employerId
            );

            users[i].user_roles[j].employeeHr = [];

            if (raw.length) {
              let employeeHr = helper.mapToEmployee(raw);

              users[i].user_roles[j].employeeHr = employeeHr;
            }
          }
        }
        job.progress(Math.round((i / users.length) * 100));
      }

      job.progress(100);
      // console.log('finalizando users roles');
      done(null, { date: new Date(), users });
      //done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
