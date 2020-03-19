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
       //console.log('data2', job.data);
      const { employerId } = job.data;

      let users = [];
      const stream = await userRepository.getUsers(employerId).stream();

      let count = 0;

      stream
        .on('readable', async () => {
          try {
            let user = await stream.read();

            while (user) {
              count++;
              console.log('user', user);
              users.push(user);

              user = await stream.read();
            }
          } catch (error) {
            done(error);
          }
        })
        .on('end', () => {
          job.progress(100);
          searchUserRolesWorker.addToQueue(users, employerId);
          done(null, { date: new Date(), count, users });
        })
        .on('error', done);
      //job.progress(100);
      //done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
