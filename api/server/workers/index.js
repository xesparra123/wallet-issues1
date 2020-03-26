require('dotenv').config({ path: '.env' });

let requiredEnv = ['ACCESS_CODE_QUEUE_PORT'];

for (let envVar of requiredEnv) {
  if (!process.env[envVar])
    throw new Error(`${envVar} env varible must be declared in .env file`);
}

const ACCESS_CODE_QUEUE_PORT = +process.env.ACCESS_CODE_QUEUE_PORT;

//init the server
const server = require('./server');

server.listen(ACCESS_CODE_QUEUE_PORT, () => {
  console.log(`Uploads queue listening on port: ${ACCESS_CODE_QUEUE_PORT}`);
});

process.on('SIGINT', () => {
  console.log('Service stoped');
  process.exit();
});
