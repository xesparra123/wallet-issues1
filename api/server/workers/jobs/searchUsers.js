const userRepository = require('../../repositories/users');
const { createProducer, getQueue } = require('../utils');

const queueName = 'SEARCH_USERS';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const searchUserRolesWorker = require('./searchUserRoles');

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {

      let users = [];
      const stream = await userRepository.getUsers().stream();

      stream
        .on('readable', async () => {
          try {
            let user = await stream.read();

            while (user) {
              users.push(user);

              user = await stream.read();
            }
          } catch (error) {
            done(error);
          }
        })
        .on('end', () => {
          job.progress(100);
          searchUserRolesWorker.addToQueue({
            users
          });
          done(null, { date: new Date(), count: users.length });
        })
        .on('error', done);
      //job.progress(100);
      //done(null, job.data);
    } catch (error) {
      console.log('error', error);
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
