const { db, TABLES } = require('knex-conn');

const create = ({
  process_type,
  employer_id,
  history_file_id,
  employee_number,
  first_name,
  middle_name,
  last_name,
  email
}) => {
  return db
    .insert({
      process_type,
      employer_id,
      history_file_id,
      employee_number,
      first_name,
      middle_name,
      last_name,
      email
    })
    .into(TABLES.historyFileRejections);
};

module.exports = {
  create
};
