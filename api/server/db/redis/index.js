const redis = require('redis');
const { REDIS_HOST, REDIS_PORT, REDIS_AUTH } = process.env;

let redisInstance = null;
const connect = () => {
  let clientData = {
    host: REDIS_HOST,
    port: REDIS_PORT
  };

  if (REDIS_AUTH) {
    clientData.password = REDIS_AUTH;
  }

  if (!redisInstance) {
    redisInstance = redis.createClient(clientData);
  }

  redisInstance.on('connect', () => {
    console.log('Connected to redis!');
  });

  redisInstance.on('error', err => {
    console.error(`[fatal error]: ${err.message}`);
    process.exit(1);
  });

  return redisInstance;
};

const close = () => {
  return redisInstance.quit();
};

module.exports = { connect, close };
