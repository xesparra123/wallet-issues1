const db = require('../dbConnection/evercheck');

const getEmployeeHr = (number, employerId) => {
  return db.raw(
    `SELECT 
     ID_EMPLOYEE_NUMBER,
     PK_EMPLOYEE,
     DS_EMAIL,
     NM_FIRST,
     NM_MIDDLE,
     NM_LAST,
     IN_STATUS,
     DT_ADDED,
     DT_UPDATED,
     DT_REMOVED
    FROM EMPLOYEE WHERE ID_EMPLOYEE_NUMBER ='115668' AND ID_EMPLOYER = 365`
  );
  //return db.raw(`SELECT * FROM EMPLOYEE WHERE ID_EMPLOYEE_NUMBER = '${number}' AND ID_EMPLOYER = ${employerId}`);
};

module.exports = {
  getEmployeeHr
};
