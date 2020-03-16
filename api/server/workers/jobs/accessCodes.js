const workers = require('../../processor/processor');

const { createProducer, getQueue } = require('../utils');

const queueName = 'ACCESS_CODES';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      const { set: route } = job.data;

      console.log('Estoy por aqui', route);
      
      await workers.createItemsToValidateOnWallet(route);

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
