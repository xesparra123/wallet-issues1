/*8. user con employee/candidate duplicado del mismo employer */

let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../../utils');

const queueName = 'USERS_MANY_ENTITIES_FIXER';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const { deleteUserRole } = require('../../../repositories/userRoles');

const { deleteEmployeeById } = require('../../../repositories/employees');
const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const readFile = async () => {
  const route = path.join(__dirname, '/Files/caseEight.json');
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

      let deletedEmployees = 0,
        deletedRoles = 0;
      for (let i = 0; i < data.employeesToDelete.length; i++) {
        console.log('Eliminando employee..', data.employeesToDelete[i].id);
        await deleteEmployeeById(data.employeesToDelete[i].id);
        deletedEmployees++;
      }

      job.progress(50);

      console.log('Case 8: 50%');

      for (let j = 0; j < data.rolesToDelete.length; j++) {
        console.log('Eliminando user role..', data.rolesToDelete[j].id);
        await deleteUserRole(data.rolesToDelete[j].id);
        deletedRoles++;
        //TODO: ELIMINAR ROLE
      }

      console.log('Case 8: 100%');

      console.log('Generando reporte...');
      await writeFile({ deletedEmployees, deletedRoles }, 'caseEight');

      job.progress(100);

      done(null, { date: new Date() });
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
