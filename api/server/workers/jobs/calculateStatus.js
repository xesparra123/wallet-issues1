const SetEntity = require('../data/set/entity');
const SetHelper = require('../data/set/helper');
const SummaryHelper = require('../data/history-file-summary/helper');

const {
  createProducer,
  getQueue,
  mappedRequirement,
  updateFlagInRedis,
  sendMessage,
  countFileRows
} = require('../utils');
const {
  SUMMARY_ERRORS: { UNKNOWN },
  PROCESS_ERROR_UPLOAD
} = require('../../utils/constants');

const { getLicenses } = require('../../services/evercheck');
const queueName = 'CALCULATE_STATUS';
const concurrency = process.env[queueName] || 50;

const queue = getQueue(queueName);

const addToQueue = set => {
  return createProducer(queue, queueName, { set }, 2, 10000);
};

const processJob = async () => {
  queue.process(queueName, concurrency, async (job, done) => {
    try {
      const {
        setId,
        employerId,
        fileId,
        employeeNumber,
        startDate,
        code,
        description,
        rowId,
        totalItems,
        roomId,
        userId,
        isUnknown
      } = job.data.set;

      let items = [],
        processError = null,
        processType = null;

      //Get set and it's requirements
      const setEntity = new SetEntity({ id: setId, fileId });
      const set = await setEntity.findById();
      let status;

      //Create Summary
      const mappedRejections = {
        type: 'warnings',
        fieldEdited: null,
        employerId,
        employeeNumber
      };

      if (isUnknown) {
        items.push({
          ...mappedRejections,
          processType: UNKNOWN,
          processError: PROCESS_ERROR_UPLOAD[UNKNOWN]
        });
        status = UNKNOWN;
      } else {
        let requirements =
          set && set.requirements
            ? JSON.parse(set.requirements.toString())
            : [];

        if (requirements.length > 0)
          requirements = mappedRequirement(requirements);
        //get Licenses from ES
        const { licenses } = await getLicenses({
          employerId,
          employeeNumber
        });

        const credentials = SetHelper.hasExcludedStatus({ licenses });

        //Calculate status
        try {
          status = SetHelper.calculateStatus({
            reqs: requirements,
            credentials,
            startDate
          });
        } catch (error) {
          status = UNKNOWN;
          processType = UNKNOWN;
          processError = PROCESS_ERROR_UPLOAD[UNKNOWN];
        }

        //Send event to wallet
        await SetHelper.updateRequirementsEvent({
          requirements,
          employeeNumber,
          employerId,
          key: set.key,
          code,
          description
        });

        if (status !== set.prev_status && status === UNKNOWN)
          items.push({ ...mappedRejections, processType, processError });
      }
      //Update status
      setEntity.status = status;
      await setEntity.updateStatus();

      await SummaryHelper.createHistoryFileSummary({
        historyFileId: fileId,
        items,
        employeeNumber,
        employerId
      });

      //Send Calulate to Redis
      await updateFlagInRedis({ fileId, rowId });

      //Send event calculated status to finish
      const totalProcessed = await countFileRows(fileId);
      if (totalItems === totalProcessed)
        await sendMessage({
          data: JSON.stringify({
            fileId,
            rowId,
            totalItems,
            roomId,
            userId,
            employerId
          })
        });

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      done(error.response ? error.response.data : error);
    }
  });
};

module.exports = { addToQueue, processJob };
