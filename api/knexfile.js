const path = require('path');
const BASE_PATH = path.join(__dirname, 'server', 'db');
var enviroments = {};
var env = process.env.NODE_ENV || 'development';

const {
  DB_CLIENT = 'mysql',
  DB_USER = 'admin',
  DB_PASSWORD = 'WalletBackup2020*',
  DB_HOST = 'database-wallet.cagbkfjw0lr1.us-east-1.rds.amazonaws.com',
  DB_NAME = 'wallet_auth1303020'
} = process.env;

enviroments.development = {
  client: DB_CLIENT,
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  },
  migrations: {
    directory: path.join(BASE_PATH, 'migrations')
  }
};

module.exports = enviroments[env];