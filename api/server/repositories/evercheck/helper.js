const mapToEmployee = (data = []) => {
  const employees = [];

  data.forEach(each => {
    const {
      ID_EMPLOYEE_NUMBER: number,
      PK_EMPLOYEE: id,
      DS_EMAIL: email,
      NM_FIRST: firstName,
      NM_MIDDLE: middleName,
      NM_LAST: lastName,
      IN_STATUS: status,
      DT_ADDED: dt_added,
      DT_UPDATED: dt_updated,
      DT_REMOVED: dt_removed
    } = each;

    const employee = {
      number,
      id,
      email,
      firstName,
      middleName,
      lastName,
      status,
      dt_added,
      dt_updated,
      dt_removed
    };

    employees.push(employee);
  });

  return employees;
};

module.exports = { mapToEmployee };
