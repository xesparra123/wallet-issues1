require('newrelic');
require('dotenv').config({ path: '../../.env' });

let requiredEnv = ['UPLOAD_SERVER_PORT', 'FIND_OR_CREATE_SQS_URL'];

for (let envVar of requiredEnv) {
  if (!process.env[envVar])
    throw new Error(`${envVar} env varible must be declared in .env file`);
}

const UPLOAD_SERVER_PORT = +process.env.UPLOAD_SERVER_PORT;

//init the server
const server = require('./server');

server.listen(UPLOAD_SERVER_PORT, () => {
  console.log(`Uploads queue listening on port: ${UPLOAD_SERVER_PORT}`);
});

process.on('SIGINT', () => {
  console.log('Service stoped');
  process.exit();
});
