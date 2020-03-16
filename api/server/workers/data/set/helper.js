const intersection = require('lodash/intersection');
const dayjs = require('dayjs');
const {
  WRONG_STATUSES,
  APPLICATIONS,
  ACTIONS_TYPES
} = require('../../../utils/constants');
const { eventGateway } = require('../../../services');

const calculateStatus = ({ credentials, reqs, startDate }) => {
  if (reqs.length === 0) return 'SATISFIED';

  return validateStatus({ reqs, credentials, startDate });
};

const validateStatus = ({ reqs, credentials, startDate }) => {
  const { matchCounter = 0, requirementsToEvaluate = [] } = matchRequirements({
    reqs,
    credentials,
    startDate
  });

  if (matchCounter === 0) return 'NOT_SATISFIED';

  const isSatisfied = evaluateRequirements({ reqs: requirementsToEvaluate });
  if (isSatisfied) return 'SATISFIED';

  return 'NOT_SATISFIED';
};

const matchRequirements = ({ reqs = [], credentials = [], startDate }) => {
  let matchCounter = 0;
  const requirementsToEvaluate = reqs.map(req => {
    const { profession, isTbo, tboDays, group } = req;
    let isValidTboDate = true;
    let match = true;

    const { name, code, employerProfessionCode } = professionFormatter(
      profession
    );

    if (
      (isTbo && !validateStartDate({ tboDays, date: startDate })) ||
      !startDate
    ) {
      isValidTboDate = false;
    }

    if (!isTbo || (isTbo && !isValidTboDate)) {
      match = credentials.some(({ professionCode, profession, type }) =>
        type === 'CERTIFICATION'
          ? professionCode === code ||
            profession === name ||
            employerProfessionCode === professionCode
          : profession === code ||
            employerProfessionCode === profession ||
            profession === name
      );
    }

    if (match) matchCounter++;
    return { match, code, group };
  });

  return { matchCounter, requirementsToEvaluate };
};

const professionFormatter = profession => {
  const { code, name, employerProfessionCode: ep } = profession;

  return {
    name: name ? name.toUpperCase() : null,
    code: code ? code.toUpperCase() : null,
    employerProfessionCode: ep ? ep.toUpperCase() : null
  };
};

const validateStartDate = ({ tboDays, date }) => {
  let starDate = new Date(date);
  starDate.setDate(starDate.getDate() + (tboDays + 1));
  return new Date() <= starDate;
};

const evaluateRequirements = ({ reqs = [] }) => {
  const initGroup = reqs.reduce((prevGroup, { group }) => {
    return group <= prevGroup ? group : prevGroup;
  }, 1);

  const maxGroup = reqs.reduce((lastGroup, { group }) => {
    return group >= lastGroup ? group : lastGroup;
  }, 0);

  let returnValue = false;

  for (let i = initGroup; i <= maxGroup; i++) {
    const groupRequirements = reqs.filter(({ group }) => group === i);

    if (groupRequirements.length !== 0) {
      returnValue = groupRequirements.some(({ match }) => match);

      if (!returnValue) {
        return returnValue;
      }
    }
  }

  return returnValue;
};

const hasExcludedStatus = ({ licenses }) => {
  return licenses.filter(
    ({ active, statuses, label, expirationDate }) =>
      active &&
      !hasBadLicenses({ statuses }) &&
      label !== 'TAKE_ACTION' &&
      validateExpirationDate({ expirationDate })
  );
};

const hasBadLicenses = ({ statuses }) => {
  return !!intersection(WRONG_STATUSES, statuses).length;
};

const validateExpirationDate = ({ expirationDate }) => {
  let date, validate;
  if (expirationDate) {
    date = dayjs(new Date(expirationDate));
    validate = date.diff(dayjs()) > 0;
  }
  return expirationDate ? validate : true;
};

const updateRequirementsEvent = async data => {
  const source = {
    type: ACTIONS_TYPES.UPDATE_REQUIREMENTS,
    date: new Date(),
    version: '1',
    application: APPLICATIONS.POSTHIRE
  };

  await eventGateway.updateRequirement({
    data: {
      ...data,
      source
    }
  });
};

const finishUpload = async data => {
  const source = {
    type: ACTIONS_TYPES.UPLOAD_FINISH,
    date: new Date(),
    version: '1',
    application: APPLICATIONS.POSTHIRE
  };

  await eventGateway.updateRequirement({
    data: {
      ...data,
      source
    }
  });
};

module.exports = {
  calculateStatus,
  hasExcludedStatus,
  updateRequirementsEvent,
  finishUpload
};
