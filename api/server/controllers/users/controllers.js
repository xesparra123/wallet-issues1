const userRepository = require('../../repositories/users');
const workers = require('../../processor/processor');
let fs = require('fs');
let path = require('path');




const getAccessCodeRevoked = async (req, res, next) => {
  try {
    let route = path.join(__dirname, 'Files/accessCodeRevoked.json');
    //Accounts with access code revoked, username and password null
    let accessCodes = await userRepository.getAccessCodeRevoked();
    let json = JSON.stringify(accessCodes);
    //validate if the file exist, I replace the file always 
    let fileExits = await fs.existsSync(route);
    if(fileExits) await fs.unlinkSync(route);
    await fs.writeFileSync(route, json, 'utf8');

    //send to worker to valida on wallet data
    await workers.createItemsToValidateOnWallet(route);
    res.status(200).json({msg:'Archivo encolado para procesar', route});
  } catch (error) {
    next(error);
  }
};

const getEmployeesDuplicated = async (req, res, next) => {
  try {
    const { employerId } = req.params;
    let route = path.join(__dirname, 'Files',`${employerId}-employees.json`);
    //Accounts with access code revoked, username and password null
    let employeesDuplicated = await userRepository.getEmployeesDuplicated(employerId);
    let json = JSON.stringify(employeesDuplicated);
    //validate if the file exist, I replace the file always 
    let fileExits = await fs.existsSync(route);
    if(fileExits) await fs.unlinkSync(route);
    await fs.writeFileSync(route, json, 'utf8');

    //send to worker to valida on wallet data
    await workers.searchEmployeesDuplicates(route);
    res.status(200).json({msg:'Archivo encolado para procesar', route});
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAccessCodeRevoked,
  getEmployeesDuplicated
};
