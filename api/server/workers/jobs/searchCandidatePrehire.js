let fs = require('fs');
let path = require('path');

const applicantRepository = require('../../repositories/applicants');
const { createProducer, getQueue } = require('../utils');

const queueName = 'SEARCH_CANDIDATE_PREHIRE';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const searchUserRolesWorker = require('./searchUserRoles');

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const writeFile = async users => {
  let route = path.join(
    __dirname,
    'Files/usersEmployeesHRCandidatesPrehire.json'
  );

  let json = JSON.stringify(users);

  let fileExits = await fs.existsSync(route);
  if (fileExits) await fs.unlinkSync(route);

  await fs.writeFileSync(route, json, 'utf8');
};

const readFile = async () => {
  const route = path.join(__dirname, 'Files/usersEmployeesHRCandidates.json');
  const rawdata = fs.readFileSync(route);
  return JSON.parse(rawdata);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      let users = await readFile();

      for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < users[i].candidates.length; j++) {
          let prehireApplicantId = users[i].candidates[j].prehireApplicantId;

          let candidates = await applicantRepository.getApplicantPrehire({
            prehireApplicantId
          });

          users[i].candidates[j].candidatesPrehire = [];

          if (candidates.length > 0) {
            users[i].candidates[j].candidatesPrehire = candidates;
          }
        }

        console.log(
          `Searching applicants prehire.. i:${i} - total: ${
            users.length
          } -  ${Math.round(((i + 1) / users.length) * 100)}%`
        );
        job.progress(Math.round((i / users.length) * 100));
      }

      job.progress(100);
      await writeFile(users);
      searchUserRolesWorker.addToQueue();
      // console.log('finalizando users roles');
      done(null, { date: new Date() });
      //done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
