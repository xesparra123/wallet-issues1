require('dotenv').config({ path: '.env' });

const Arena = require('bull-arena');
const express = require('express');
const port = process.env.ARENA_APP_PORT;
const app = express();
const { queuesProcesses } = require('./utils');

const workers = require('./jobs');

const requiredEnv = [
  'REDIS_PORT',
  'REDIS_HOST',
  'ARENA_APP_PORT',
  'REDIS_AUTH'
];

for (let envVar of requiredEnv) {
  if (!process.env[envVar])
    throw new Error(`${envVar} env varible must be declared in .env file`);
}
let queues = [];

for (const queueName of queuesProcesses) {
  queues.push({
    name: queueName,
    hostId: 'wallet',
    redis: {
      port: process.env['REDIS_PORT'],
      host: process.env['REDIS_HOST'],
      password: process.env['REDIS_AUTH'],
      db: 0
    }
  });
}

workers.processAll();

const arenaConfig = Arena({ queues }, { basePath: '/', disableListen: true });

app.use('/ui', arenaConfig);

app.listen(port, () => {
  console.log(`Bull Arena Running on port ${port}`);
});
