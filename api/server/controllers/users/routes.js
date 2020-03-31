const controller = require('./controllers');
const express = require('express');

const router = express.Router();
const usersRouter = express.Router();

usersRouter.get('/get-access-codes-revoked', controller.getAccessCodeRevoked);
usersRouter.get('/get-employees-duplicated', controller.getEmployeesDuplicated);
usersRouter.get('/testCreateFile', controller.testGenerateFile);
usersRouter.get('/runFixer', controller.runFixer);

router.use('/users', usersRouter);
module.exports = router; 