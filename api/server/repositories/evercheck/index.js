const db = require('../dbConnection/evercheck');

const getEmployeeHr = (number, employerId) => {
  return db.raw(
    `SELECT * FROM EMPLOYEE WHERE ID_EMPLOYEE_NUMBER = '${number}' AND ID_EMPLOYER = ${employerId}`
  );
};

module.exports = {
  getEmployeeHr
};
 