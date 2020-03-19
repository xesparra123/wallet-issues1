const userRepository = require('../../repositories/users');
const { createProducer, getQueue } = require('../utils');

const queueName = 'SEARCH_USER_ROLES';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      //console.log('data2', job.data);
      
      console.log('vengo por aquii')
      const { users, employerId } = job.data;

      for (let i = 0; i < users.length; i++) {
        let roles = await userRepository.userRolesByUserIdAndEmployerId(
          users[i].id,
          employerId
        );

        users[i].user_roles = [];

        if (roles.length)
          users[i].user_roles = roles;

        job.progress(Math.round((i / users.length)*100));
      }

      console.log('finalizando users roles');
      done(null, { date: new Date(), users });
      //done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
