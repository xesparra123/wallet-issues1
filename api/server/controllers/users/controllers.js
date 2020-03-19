const userRepository = require('../../repositories/users');
const processor = require('../../processor/processor');
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

const testGenerateFile = async (req, res, next) => {
  try {

    let data = {
      "date": "2020-03-19T04:10:54.966Z",
      "users": [
        {
          "id": 790678,
          "firstName": "SARAH",
          "middleName": "ELIZABETH",
          "lastName": "JONES",
          "email": "SARAH.JONES2@PROVIDENCE.ORG",
          "accountId": 7863,
          "user_roles": [
            {
              "id": 134768,
              "cd_entity": "employee",
              "id_entity": 3863,
              "status": 1,
              "userId": 790678,
              "employerId": 334,
              "createdAt": "2019-07-18T10:08:44.000Z",
              "updatedAt": "2019-07-18T10:08:44.000Z",
              "migrated": 0,
              "employees": [
                {
                  "id": 3863,
                  "firstName": "SARAH",
                  "middleName": "BAILEY",
                  "lastName": "JONES",
                  "number": "450268",
                  "email": "SARAH.JONES2@PROVIDENCE.ORG",
                  "active": 1,
                  "accountId": 7863,
                  "evercheckId": 4801906,
                  "createdAt": "2018-02-07T19:19:25.000Z",
                  "updatedAt": "2018-02-07T19:19:33.000Z",
                  "employerId": 334,
                  "roomId": null,
                  "userId": 790678
                }
              ],
              "employeeHr": [
                {
                  "number": "115668",
                  "id": 4514454,
                  "email": null,
                  "firstName": "KENNETH",
                  "middleName": null,
                  "lastName": "KLARMAN",
                  "status": 0,
                  "dt_added": "2015-02-12T13:45:55.000Z",
                  "dt_updated": "2019-10-16T17:50:11.000Z",
                  "dt_removed": "2019-10-16T17:50:11.000Z"
                }
              ]
            },
            {
              "id": 375582,
              "cd_entity": "employee",
              "id_entity": 347156,
              "status": 1,
              "userId": 790678,
              "employerId": 334,
              "createdAt": "2019-11-19T09:13:01.000Z",
              "updatedAt": "2019-11-19T09:13:01.000Z",
              "migrated": 0,
              "employees": [
                {
                  "id": 347156,
                  "firstName": "",
                  "middleName": null,
                  "lastName": "",
                  "number": "510628",
                  "email": "",
                  "active": 1,
                  "accountId": null,
                  "evercheckId": null,
                  "createdAt": "0000-00-00 00:00:00",
                  "updatedAt": "0000-00-00 00:00:00",
                  "employerId": 334,
                  "roomId": null,
                  "userId": 790678
                }
              ],
              "employeeHr": [
                {
                  "number": "115668",
                  "id": 4514454,
                  "email": null,
                  "firstName": "KENNETH",
                  "middleName": null,
                  "lastName": "KLARMAN",
                  "status": 0,
                  "dt_added": "2015-02-12T13:45:55.000Z",
                  "dt_updated": "2019-10-16T17:50:11.000Z",
                  "dt_removed": "2019-10-16T17:50:11.000Z"
                }
              ]
            }
          ]
        }
      ]
    }; 
    
    await processor.createOrUpdateReportFile('employeesDuplicateOnWalletAndHR',data);
    res.status(200).json({
      msg: 'Done'
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


module.exports = {
  getAccessCodeRevoked,
  getEmployeesDuplicated,
  testGenerateFile
};
