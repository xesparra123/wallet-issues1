const bull = require('bull');
const { connect } = require('../db/redis');
const redis = connect();
const { promisify } = require('util');
const sadd = promisify(redis.sadd).bind(redis);
const sinter = promisify(redis.sinter).bind(redis);
const scard = promisify(redis.scard).bind(redis);

const { REGION, API_VERSION, UPLOAD_FINISH_URL } = process.env;
const AWS = require('aws-sdk');
AWS.config.update({ region: REGION });

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
    removeOnComplete: true
  };

  return queue.add(queueName, jobData, jobOptions);
};

const queueNames = { calculateStatus: 'CALCULATE_STATUS' };

const mappedRequirement = requirements => {
  let reqArray = [];
  for (const req in requirements) {
    const reqs = {
      tboDays: requirements[req].tboDays,
      isTbo: requirements[req].isTbo,
      profession: {
        _id: requirements[req].profession._id,
        id: requirements[req].profession.id,
        code: requirements[req].profession.code,
        name: requirements[req].profession.name,
        board: {
          isUnmonitored: requirements[req].profession.board.isUnmonitored,
          needCertState: requirements[req].profession.board.needCertState,
          _id: requirements[req].profession.board._id,
          id: requirements[req].profession.board.id,
          name: requirements[req].profession.board.name,
          stateId: requirements[req].profession.board.stateId,
          url: requirements[req].profession.board.url
        },
        type: requirements[req].profession.type,
        isManual: requirements[req].profession.isManual,
        mask: requirements[req].profession.mask,
        licenseRegexp: requirements[req].profession.licenseRegexp,
        employerProfessionCode:
          requirements[req].profession.employerProfessionCode
      },
      group: requirements[req].group,
      employerId: requirements[req].employerId
    };
    reqArray.push(reqs);
  }
  return reqArray;
};

const updateFlagInRedis = async ({ fileId, rowId }) => {
  const ENTITY = 'files';

  return await sadd(`${ENTITY}:PH:${fileId}`, rowId);
};

const sendMessage = async ({ data, QueueUrl = UPLOAD_FINISH_URL }) => {
  const sqs = new AWS.SQS({ apiVersion: API_VERSION });
  var params = {
    MessageBody: data,
    QueueUrl
  };
  await sqs.sendMessage(params).promise();
};

const countFileRows = async fileId => {
  const ENTITY = 'files';
  const HR = `${ENTITY}:HR:${fileId}`;
  const PH = `${ENTITY}:PH:${fileId}`;
  const FAIL = `${ENTITY}:FAIL:${fileId}`;

  const completed = await sinter(HR, PH);
  const failed = await scard(FAIL);

  return completed.length + failed;
};

const queuesProcesses = ['CALCULATE_STATUS', 'START_UPLOAD_PROCESS'];

module.exports = {
  createProducer,
  getQueue,
  queueNames,
  mappedRequirement,
  updateFlagInRedis,
  sendMessage,
  countFileRows,
  queuesProcesses
};
