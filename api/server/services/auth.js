const path = require('path');
require('dotenv').config(path.join('../.env'));
const axios = require('axios');

this.apiKey = process.env.WALLET_API_KEY;
this.apiSecret = process.env.WALLET_API_SECRET;
this.baseUrl = process.env.AUTH_URL;
this.appCode = process.env.WALLET_APPLICATION_CODE;

const request = axios.create({
  baseURL: this.baseUrl,
  auth: {
    username: this.apiKey,
    password: this.apiSecret
  }
});

const updateAccountRoles = (accountId, payload) => {
  return request.put(`/accounts/${accountId}/roles`, payload);
};

module.exports = {
  updateAccountRoles
};
