module.exports = {
  calculateStatus: require('./calculateStatus'),
  startUploadProcess: require('./startUploadProcess'),
  processAll: function() {
    this.calculateStatus.processJob();
    this.startUploadProcess.processJob();
  }
};
