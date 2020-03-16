const fs = require('fs');
const path = require('path');

const nameAllDirectories = fs.readdirSync(path.resolve('server/controllers'));
let allRoutes = [];
nameAllDirectories.forEach(currentDirectory => {
  if (currentDirectory !== 'index.js') {
    let route = require(`./${currentDirectory}`);
    allRoutes.push(route);  
  }
});
module.exports = allRoutes;