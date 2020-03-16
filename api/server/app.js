require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const controllers = require('./controllers');


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const indexRouter = express.Router();
indexRouter.get('/', (req, res) =>
  res.send({ response: 'Security REST API' })
);

app.use('/', indexRouter);

controllers.map((controller)=>{
  app.use('/', controller);
});

/*eslint no-unused-vars: ["error", { "args": "none" }]*/
app.use((error, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.url} ${error.message}`);
  }
  return res.status(500).send({ error: error.message });
});

module.exports = app;
