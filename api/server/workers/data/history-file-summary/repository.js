const { db, TABLES } = require('knex-conn');

const create = ({
  process_type,
  type,
  employer_id,
  history_file_id,
  employee_number,
  field_edited,
  evercheck_employee_id,
  process_error
}) => {
  try {
    return db
      .insert({
        process_type,
        type,
        employer_id,
        history_file_id,
        employee_number,
        field_edited,
        evercheck_employee_id,
        process_error
      })
      .into(TABLES.historyFileSummary)
      .returning(['id', 'status']);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return;
    throw err;
  }
};

module.exports = {
  create
};
