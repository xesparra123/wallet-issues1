const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const workers = require('./jobs');
const os = require('os');

let app = express();

workers.processAll();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({
    service: `POSTHIRE Queue Service is Still Running - ${os.hostname()}`
  });
});

app.post('/start-upload-process', async (req, res, next) => {
  try {
    const { token, fileId, employerId, userId, totalItems, roomId } = req.body;

    if (!fileId && !token)
      throw new Error('Upload Process: [ token,fileId] required');

    await workers.startUploadProcess.addToQueue({
      token,
      fileId,
      employerId,
      userId,
      totalItems,
      roomId
    });

    res.json({
      status: 'InQueue',
      message: 'The Upload process has been enqueued...'
    });
  } catch (err) {
    next(err);
  }
});

app.use((error, req, res, next) => {
  console.log(`${req.method} ${req.url} ${error.message}`);
  res.status(500).json({ message: error.message || error });
});

module.exports = app;
