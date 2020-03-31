require('dotenv').config({ path: '.env' });
const bull = require('bull');
//const { connect } = require('../db/redis');
//const redis = connect();
// const { promisify } = require('util');
// const sadd = promisify(redis.sadd).bind(redis);
// const sinter = promisify(redis.sinter).bind(redis);
// const scard = promisify(redis.scard).bind(redis);

const {
  ATTEMPTS,
  BACK_OFF_TIME,
  REDIS_PORT,
  REDIS_HOST,
  REDIS_AUTH
} = process.env;

let queues = {};

const getQueue = queueName => {
  if (!queues[queueName]) {
    queues[queueName] = new bull(queueName, {
      redis: {
        port: REDIS_PORT,
        host: REDIS_HOST,
        password: REDIS_AUTH,
        db: 0
      }
    });
  }

  return queues[queueName];
};

const createProducer = (
  queue,
  queueName,
  jobData,
  attempts = ATTEMPTS,
  delayToRestart = BACK_OFF_TIME
) => {
  let jobOptions = {
    attempts,
    backoff: { type: 'fixed', delay: delayToRestart },
    removeOnComplete: false
  };

  return queue.add(queueName, jobData, jobOptions);
};

const queueNames = {
  accessCodes: 'ACCESS_CODES',
  validateAccount: 'VALIDATE_ACCOUNT',
  searchEmployees: 'SEARCH_EMPLOYEES',
  searchUsers: 'SEARCH_USERS',
  searchUserRoles: 'SEARCH_USER_ROLES',
  searchEmployeeEntity: 'SEARCH_EMPLOYEE_ENTITY',
  searchEmployeeHr: 'SEARCH_EMPLOYEE_HR',
  filterTypes: 'FILTER_TYPES',
  searchCandidatesPrehire: 'SEARCH_CANDIDATE_PREHIRE',
  searchCandidateEntity: 'SEARCH_CANDIDATE_ENTITY',
  filterFixer: 'FILTERS_FIXER',
  userOneRoleWithEmployeeHR: 'USER_ONE_ROLE_WITH_EMPLOYEE_HR',
  userManyRolesButEmployee: 'USER_ROLES_WITHOUT_EMPLOYEE',
  userManyRolesButEmployeeHR:'USER_ROLES_WITH_EMPLOYEE_BUT_HR'
};

// const updateFlagInRedis = async ({ fileId, rowId }) => {
//   const ENTITY = 'files';

//   return await sadd(`${ENTITY}:PH:${fileId}`, rowId);
// };

// const sendMessage = async ({ data, QueueUrl = UPLOAD_FINISH_URL }) => {
//   const sqs = new AWS.SQS({ apiVersion: API_VERSION });
//   var params = {
//     MessageBody: data,
//     QueueUrl
//   };
//   await sqs.sendMessage(params).promise();
// };

// const countFileRows = async fileId => {
//   const ENTITY = 'files';
//   const HR = `${ENTITY}:HR:${fileId}`;
//   const PH = `${ENTITY}:PH:${fileId}`;
//   const FAIL = `${ENTITY}:FAIL:${fileId}`;

//   const completed = await sinter(HR, PH);
//   const failed = await scard(FAIL);

//   return completed.length + failed;
// };

const queuesProcesses = [
  'ACCESS_CODES',
  'VALIDATE_ACCOUNT',
  'SEARCH_EMPLOYEES',
  'SEARCH_USERS',
  'SEARCH_USER_ROLES',
  'SEARCH_EMPLOYEE_ENTITY',
  'SEARCH_EMPLOYEE_HR',
  'FILTER_TYPES',
  'SEARCH_CANDIDATE_PREHIRE',
  'SEARCH_CANDIDATE_ENTITY',
  'FILTERS_FIXER',
  'USER_ONE_ROLE_WITH_EMPLOYEE_HR',
  'USER_ROLES_WITHOUT_EMPLOYEE',
  'USER_ROLES_WITH_EMPLOYEE_BUT_HR'
];

module.exports = {
  createProducer,
  getQueue,
  queueNames,
  //updateFlagInRedis,
  queuesProcesses
};
