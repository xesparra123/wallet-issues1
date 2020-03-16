const Repository = require('./repository');

class HistoryFileSummary {
  constructor(params) {
    this.process_type = params.processType;
    this.type = params.type;
    this.employer_id = params.employerId;
    this.history_file_id = params.historyFileId;
    this.employee_number = params.employeeNumber;
    this.field_edited = params.fieldEdited;
    this.evercheck_employee_id = params.evercheckEmployeeId;
    this.process_error = params.processError;
  }

  async create() {
    const {
      process_type,
      type,
      employer_id,
      history_file_id,
      employee_number,
      field_edited,
      evercheck_employee_id,
      process_error
    } = this;
    const result = await Repository.create({
      process_type,
      type,
      employer_id,
      history_file_id,
      employee_number,
      field_edited,
      evercheck_employee_id,
      process_error
    });
    return { id: result[0] };
  }
}

module.exports = HistoryFileSummary;
