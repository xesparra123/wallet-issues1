require('dotenv').config({ path: '.env' });
const { calculateStatus } = require('./jobs');
const sqs = require('../utils/sqs');

const { AWS_SQS_URL, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION } = process.env;

const awsCredentials = {
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION
};

const start = () => {
  console.log('***** CALCULATE STATUS WORKER START *****');
  const pollParams = {
    queueUrl: AWS_SQS_URL,
    pollHandler: pollHandler,
    isCallback: false,
    batchSize: 10
  };

  sqs.poll(pollParams, awsCredentials);
};

const pollHandler = async notification => {
  try {
    await calculateStatus.addToQueue(notification);
  } catch (error) {
    console.log('error', error);
    throw error;
  }
};

start();
