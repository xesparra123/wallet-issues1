const HistoryFileSummaryEntity = require('./entity');
const HistoryFileRejectionsEntity = require('../history-file-rejection/entity');
const {
  SUMMARY_ERRORS: { POSITION_CODE_EMPTY }
} = require('../../../utils/constants');

async function createHistoryFileSummary({
  firstName = '',
  middleName = '',
  lastName = '',
  emailAdress = '',
  historyFileId,
  evercheckEmployeeId,
  items,
  isPositionEmpty = false,
  employeeNumber,
  employerId
}) {
  if (isPositionEmpty) {
    const type = 'warnings';
    const processType = POSITION_CODE_EMPTY;
    const fieldEdited = null;
    const processError = 'The set with Position Code empty was not created';
    items.push({
      type,
      processType,
      employerId,
      employeeNumber,
      fieldEdited,
      processError
    });
  }

  const rejections = items.filter(({ type }) => type === 'rejection');
  if (rejections.length)
    await addHistoryFileRejections({
      firstName,
      middleName,
      lastName,
      emailAdress,
      historyFileId,
      employeeNumber,
      employerId,
      rejections
    });

  return await Promise.all(
    items.map(
      async ({
        processType,
        type,
        employerId,
        employeeNumber,
        fieldEdited,
        processError
      }) => {
        const historyFileSummaryEntity = new HistoryFileSummaryEntity({
          processType,
          type,
          employerId,
          employeeNumber,
          historyFileId,
          evercheckEmployeeId,
          fieldEdited,
          processError
        });

        await historyFileSummaryEntity.create();
      }
    )
  );
}

async function addHistoryFileRejections({
  firstName,
  middleName,
  lastName,
  emailAdress,
  historyFileId,
  employeeNumber,
  employerId,
  rejections
}) {
  for (let rejection of rejections) {
    const { processType } = rejection;
    const hfr = new HistoryFileRejectionsEntity({
      processType,
      employerId,
      employeeNumber,
      historyFileId,
      firstName,
      middleName,
      lastName,
      emailAdress
    });

    await hfr.create();
  }
}

module.exports = {
  createHistoryFileSummary,
  addHistoryFileRejections
};
