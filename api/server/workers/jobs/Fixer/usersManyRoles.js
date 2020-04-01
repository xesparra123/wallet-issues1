/*7. user con mas de un user rol y tienen employees en wallet, y tienen employees en HR (userManyRolesWithEmployeeWithHR)
 *select one of them
 *search all of the user roles and references duplicated and delete all of them*/

let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../../utils');

const queueName = 'USERS_MANY_ROLES_FIXER';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const {
  deleteUserRole,
  updateRoleStatus
} = require('../../../repositories/userRoles');

const { updateEmployeeStatus } = require('../../../repositories/employees');
const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const readFile = async () => {
  const route = path.join(__dirname, '/Files/caseSeven.json');
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const writeFile = async (data, fileName) => {
  let route = path.join(__dirname, `Reports/${fileName}.json`);

  let json = JSON.stringify(data);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);

  await fs.writeFileSync(route, json, 'utf8');
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let data = await readFile();
      let rolesUpdated = 0,
        employeesUpdated = 0,
        rolesDeleted = 0;

      for (let i = 0; i < data.rolesToDelete.length; i++) {
        console.log('Eliminando user role..', data.rolesToDelete[i].id);
        await deleteUserRole(data.rolesToDelete[i].id, 'employee');
        rolesDeleted++;
      }

      job.progress(33);

      console.log('Case 7: 33%');

      for (let j = 0; j < data.rolesToUpdate.length; j++) {
        console.log('Actualizando user role..', {
          id: data.rolesToUpdate[j].id,
          status: data.rolesToUpdate[j].status
        });
        await updateRoleStatus(
          data.rolesToUpdate[j].id,
          data.rolesToUpdate[j].status
        );
        rolesUpdated++;
      }

      job.progress(66);

      console.log('Case 7: 66%');

      for (let k = 0; k < data.employeesToUpdate.length; k++) {
        console.log('Actualizando employee..', {
          id: data.employeesToUpdate[k].id,
          status: data.employeesToUpdate[k].status
        });
        await updateEmployeeStatus(
          data.employeesToUpdate[k].id,
          data.employeesToUpdate[k].status
        );
        employeesUpdated++;
      }

      console.log('Case 7: 100%');

      console.log('Generando reporte...');
      await writeFile(
        { rolesDeleted, rolesUpdated, employeesUpdated },
        'caseSeven'
      );
      job.progress(100);

      done(null, { date: new Date() });
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };