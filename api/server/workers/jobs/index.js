const accessCodes = require('./accessCodes');
const validateAccount = require('./validateAccount');
const searchEmployeesDuplicated = require('./searchEmployeesDuplicated');
const searchUsers = require('./searchUsers');
const searchUserRoles = require('./searchUserRoles');
const searchEmployeeEntity = require('./searchEmployees');
const searchEmployeeHr = require('./searchEmployeeHR');

module.exports = {
  accessCodes,
  validateAccount,
  searchEmployeesDuplicated,
  searchUsers,
  searchUserRoles,
  searchEmployeeEntity,
  searchEmployeeHr,
  processAll: function() {
    this.accessCodes.processJob();
    this.validateAccount.processJob();
    this.searchEmployeesDuplicated.processJob(); 
    this.searchUsers.processJob();
    this.searchUserRoles.processJob();
    this.searchEmployeeEntity.processJob();
    this.searchEmployeeHr.processJob();
  }
};
