let fs = require('fs');
const userRepository = require('../repositories/users');

const createItemsToValidateOnWallet = async (path) => {
  try {
    let fileStream = await fs.readFileSync(path, 'utf8');
    let accounts = JSON.parse(fileStream);
    for (let account of accounts){
      await accountToValidateOnWallet(account);
    }
  } catch (error) {
    console.log('error on createItemsToValidateOnWallet', error);
  }
};

const accountToValidateOnWallet = async (account) => {
  try {
    let users = await userRepository.userByAccountId(account.id);
    
    if (users.length === 0) console.log('account not associate to any user');
    for(let user of users ){
      //crear un archivo donde ponga si el user exist o no , de existir decir si hay algun campo que no coincide.
      if (account.firstName.toUpperCase() !== user.firstName.toUpperCase()) console.log('firstName not match');
      if (account.lastName.toUpperCase() !== user.lastName.toUpperCase()) console.log('lastName not match');
      if (account.email.toUpperCase() !== user.email.toUpperCase()) console.log('email not match');
      //add user roles
      let userWithRoles =  await addUserRolesToUser(user);
      let userWithHisMatch = await searchMatchUsers(userWithRoles);
      // crear un documento nuevo con userWithHisMatch
      console.log(userWithHisMatch);
    }
  } catch (error) {
    console.log('error on accountToValidateOnWallet', error);
  }
};

const addUserRolesToUser = async (user) => {
  try {
    let userRoles = await userRepository.userRolesByUserId(user.id);
    user.userRoles = userRoles;
    return user;
  } catch (error) {
    console.log('error on addUserRolesToUser', error);
  }
};

const searchMatchUsers = async (user) => {
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
      let itemWithRoles =  await addUserRolesToUser(item);
      let addAuthAccount = await userRepository.getAccountByEmail(item.email.toUpperCase().trim());
      itemWithRoles.authAccount = addAuthAccount;
      console.log('itemWithRoles',itemWithRoles);
      user.matchUsers.push(itemWithRoles);
    }
    return user;
  } catch (error) {
    console.log('error on searchMatchUsers', error);
  }
};

module.exports = {
  createItemsToValidateOnWallet
};
