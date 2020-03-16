const { createProducer, getQueue, sendMessage } = require('../utils');
const { DEFAULT_KEYS } = require('../../utils/constants');
const difference = require('lodash/difference');

const { getFileToJson } = require('../../services/storage');
const queueName = 'START_UPLOAD_PROCESS';
const concurrency = process.env[queueName] || 50;
const { FIND_OR_CREATE_SQS_URL } = process.env;
const QueueUrl = FIND_OR_CREATE_SQS_URL;

const queue = getQueue(queueName);

const addToQueue = file => {
  return createProducer(queue, queueName, { file }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      const {
        token,
        fileId,
        employerId,
        userId,
        totalItems,
        roomId
      } = job.data.file;

      const items = await getFileToJson({ token });

      for (let [rowId, item] of items.entries()) {
        const itemKeys = Object.keys(item);
        const wgKeys = difference(itemKeys, Object.keys(DEFAULT_KEYS));

        const wgResult = {};

        wgKeys.map(wg => {
          wgResult[wg] = item[wg].length > 0 ? item[wg].split('|') : [];
        });

        const employee = {};

        Object.keys(DEFAULT_KEYS).forEach(header => {
          employee[DEFAULT_KEYS[header]] = item[header] || '';
        });

        employee['workgroups'] = wgResult;
        employee['fileId'] = fileId;
        employee['employerId'] = employerId;
        employee['userId'] = userId;
        employee['rowId'] = rowId;
        employee['totalItems'] = totalItems;
        employee['roomId'] = roomId;

        await sendMessage({ data: JSON.stringify(employee), QueueUrl });
      }

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
