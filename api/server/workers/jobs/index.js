const accessCodes = require('./accessCodes');
const validateAccount = require('./validateAccount');


module.exports = {
  accessCodes,
  validateAccount,
  processAll: function() {
    this.accessCodes.processJob();
    this.validateAccount.processJob();
  }
};
