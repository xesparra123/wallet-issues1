const Repository = require('./repository');

class EmployeePositionSet {
  constructor(params) {
    this.id = params.id;
    this.status = params.status;
    this.id_imported_file = params.fileId;
  }

  async findById() {
    const { id } = this;
    return await Repository.findById({ id });
  }

  async updateStatus() {
    const { id, status, id_imported_file } = this;
    return await Repository.updateStatus({ id, status, id_imported_file });
  }
}

module.exports = EmployeePositionSet;
