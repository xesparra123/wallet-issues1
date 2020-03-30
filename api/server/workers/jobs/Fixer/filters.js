/* filtrando informacion de los casos*/

let fs = require('fs');
let path = require('path');

const { createProducer, getQueue } = require('../../utils');

const queueName = 'FILTERS_FIXER';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const readFile = async () => {
  const route = path.join(
    __dirname,
    '../Files/usersEmployeesHRCandidatesPrehireRoles.json'
  );
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const writeFile = async (users,fileName) => {
  let route = path.join(
    __dirname,
    `Files/${fileName}.json`
  );

  let json = JSON.stringify(users);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);

  await fs.writeFileSync(route, json, 'utf8');
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let users = await readFile();

      const userWithoutRoles = users.filter(
        user => user.user_roles.length === 0
      ); //user sin user rol

      await writeFile(userWithoutRoles, 'userWithoutRoles');
      console.log('Filtering cases.. 10%');

      job.progress(10);


      //AQUI DEBEN IR PONIENDO LOS DEMAS FILTROS

      job.progress(100);

      console.log('FINALIZANDO FILTER...');
      done(null, { date: new Date() });
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
