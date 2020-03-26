//const workers = require('../../processor/processor');
let path = require('path');
let route = path.join(__dirname, 'userWithHisMatch.json');
let fs = require('fs');

const { createProducer, getQueue } = require('../utils');

const queueName = 'VALIDATE_ACCOUNT';
const concurrency = process.env[queueName] || 50;

const userRepository = require('../../repositories/users');

const queue = getQueue(queueName);

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      const { set: account } = job.data;

      //await workers.accountToValidateOnWallet(account);

      let users = await userRepository.userByAccountId(account.id);

      if (users.length === 0) console.log('account not associate to any user');
      for (let user of users) {
        //crear un archivo donde ponga si el user exist o no , de existir decir si hay algun campo que no coincide.
        if (account.firstName.toUpperCase() !== user.firstName.toUpperCase())
          console.log('firstName not match');
        if (account.lastName.toUpperCase() !== user.lastName.toUpperCase())
          console.log('lastName not match');
        if (account.email.toUpperCase() !== user.email.toUpperCase())
          console.log('email not match');
        //add user roles
        let userWithRoles = await addUserRolesToUser(user);
        //await addUserRolesToUser(user);
        //TODO: CALL SEARCH MATCH USERS JOB
        let userWithHisMatch = await searchMatchUsers(userWithRoles);
        // crear un documento nuevo con userWithHisMatch
        console.log('userWithHisMatch', userWithHisMatch);

        let json = JSON.stringify(userWithHisMatch);

        await fs.appendFileSync(route, json+',', 'utf8');
        // if (fileExits) await fs.unlinkSync(route);
        

      }

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log('pi praaaaa', error);
      done(error.response ? error.response.data : error);
    }
  });
};

const addUserRolesToUser = async user => {
  try {
    let userRoles = await userRepository.userRolesByUserId(user.id);
    user.userRoles = userRoles;
    return user;
  } catch (error) {
    console.log('error on addUserRolesToUser', error);
  }
};

const searchMatchUsers = async user => {
  try {
    //add others users with the same firtName and lastName
    let params = {
      firstName: user.firstName.toUpperCase(),
      lastName: user.lastName.toUpperCase(),
      userId: user.id
    };
    user.matchUsers = [];
    let matchUsers = await userRepository.getUserByParams(params);
    for (const item of matchUsers) {
      let itemWithRoles = await addUserRolesToUser(item);
      let addAuthAccount = await userRepository.getAccountByEmail(
        item.email.toUpperCase().trim()
      );
      itemWithRoles.authAccount = addAuthAccount;
     // console.log('itemWithRoles', itemWithRoles);
      user.matchUsers.push(itemWithRoles);
    }
    return user;
  } catch (error) {
    console.log('error on searchMatchUsers', error);
  }
};

module.exports = { addToQueue, processJob };
