const accessCodes = require('./accessCodes');
const validateAccount = require('./validateAccount');
const searchEmployeesDuplicated = require('./searchEmployeesDuplicated');
const searchUsers = require('./searchUsers');
const searchUserRoles = require('./searchUserRoles');
const searchEmployeeWallet = require('./searchEmployeesByUserId');
const searchEmployeeHr = require('./searchEmployeeHR');
const filterTypes = require('./filterTypes');
const searchCandidatesPrehire = require('./searchCandidatePrehire');
const searchCandidatesWallet = require('./searchCandidatesByUserId');
const filterFixer = require('./Fixer/filters');

module.exports = {
  accessCodes,
  validateAccount,
  searchEmployeesDuplicated,
  searchUsers,
  searchUserRoles,
  searchEmployeeWallet,
  searchEmployeeHr,
  filterTypes,
  searchCandidatesPrehire,
  searchCandidatesWallet,
  filterFixer,
  processAll: function() {
    this.accessCodes.processJob();
    this.validateAccount.processJob();
    this.searchEmployeesDuplicated.processJob();
    this.searchUsers.processJob();
    this.searchUserRoles.processJob();
    this.searchEmployeeWallet.processJob();
    this.searchEmployeeHr.processJob();
    this.filterTypes.processJob();
    this.searchCandidatesPrehire.processJob();
    this.searchCandidatesWallet.processJob();
    this.filterFixer.processJob();
  }
};
