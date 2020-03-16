const Repository = require('./repository');

class HistoryFileRejection {
  constructor(params) {
    this.process_type = params.processType;
    this.employer_id = params.employerId;
    this.history_file_id = params.historyFileId;
    this.employee_number = params.employeeNumber;
    this.first_name = params.firstName;
    this.middle_name = params.middleName;
    this.last_name = params.lastName;
    this.email = params.emailAdress;
  }

  async create() {
    const {
      process_type,
      employer_id,
      history_file_id,
      employee_number,
      first_name,
      middle_name,
      last_name,
      email
    } = this;
    const result = await Repository.create({
      process_type,
      employer_id,
      history_file_id,
      employee_number,
      first_name,
      middle_name,
      last_name,
      email
    });
    return { id: result[0] };
  }
}

module.exports = HistoryFileRejection;
