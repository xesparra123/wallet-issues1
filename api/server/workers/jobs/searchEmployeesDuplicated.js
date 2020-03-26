const workers = require('../../processor/processor');

const { createProducer, getQueue } = require('../utils');

const queueName = 'SEARCH_EMPLOYEES';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {

      const { set: route } = job.data;
      //TODO: SEARCH EMPLOYEE
      await workers.searchEmployeesDuplicates(route);

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
