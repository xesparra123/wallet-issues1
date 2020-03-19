const userRepository = require('../../repositories/users');
const workers = require('../../workers/jobs');
let fs = require('fs');
let path = require('path');

const helper = require('./helper');

const getAccessCodeRevoked = async (req, res, next) => {
  try {
    let route = path.join(__dirname, 'Files/accessCodeRevoked.json');
    //Accounts with access code revoked, username and password null
    let accessCodes = await userRepository.getAccessCodeRevoked();
    let json = JSON.stringify(accessCodes);
    //validate if the file exist, I replace the file always
    let fileExits = await fs.existsSync(route);
    if (fileExits) await fs.unlinkSync(route);
    await fs.writeFileSync(route, json, 'utf8');

    //send to worker to valida on wallet data
    await workers.accessCodes.addToQueue(route);

    res.status(200).json({ msg: 'Archivo encolado para procesar', route });
  } catch (error) {
    next(error);
  }
};

const getEmployeesDuplicated = async (req, res, next) => {
  try {
    const { employerId } = req.params;
    await workers.searchUsers.addToQueue(employerId);

    // const userWithRoles = await userRepository.getUsers(employerId);

    // const usersWithOneEmployeeRole = userWithRoles.filter(user => {
    //   console.log('user', user);
    //   return user.user_roles.length === 1;
    // });

    // console.log('users with one employee role', usersWithOneEmployeeRole);

    // const userWithoutRoles = userWithRoles.filter(
    //   user => user.user_roles.length === 0
    // );

    // console.log('users without roles', userWithoutRoles);

    // const employeesMoreThanOneRoles = userWithRoles.filter(
    //   user => user.user_roles.length > 1
    // );

    // console.log('users with more than one roles', employeesMoreThanOneRoles);

    // const usersWithOneEmployeeRoleFile = path.join(
    //   __dirname,
    //   'Files/usersWithOneEmployeeRole.json'
    // );

    // const userWithoutRolesFile = path.join(
    //   __dirname,
    //   'Files/userWithoutRoles.json'
    // );

    // const employeesMoreThanOneRolesFile = path.join(
    //   __dirname,
    //   'Files/employeesMoreThanOneRoles.json'
    // );

    // await helper.generateJson(
    //   usersWithOneEmployeeRoleFile,
    //   usersWithOneEmployeeRole
    // );

    // await helper.generateJson(
    //   employeesMoreThanOneRolesFile,
    //   employeesMoreThanOneRoles
    // );

    // await helper.generateJson(userWithoutRolesFile, userWithoutRoles);

    //TODO: CALL SEARCH USERS WORKER
    // //send to worker to valida on wallet data
    //await workers.searchEmployeesDuplicates(route);
    //await workers.searchEmployeesDuplicated.addToQueue(route);

    // res.status(200).json({
    //   msg: 'Archivos encolado para procesar',
    //   files: [
    //     usersWithOneEmployeeRoleFile,
    //     userWithoutRolesFile,
    //     employeesMoreThanOneRolesFile
    //   ]
    // });

    res.status(200).json({
      msg: 'User roles process queued'
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  getAccessCodeRevoked,
  getEmployeesDuplicated
};
