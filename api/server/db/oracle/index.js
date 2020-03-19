const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OBJECT;

const oracleHelper = ({ user, password, connectString }) => {
  function getConnection() {
    return oracledb.getConnection({
      user: user,
      password: password,
      connectString: connectString
    });
  }

  function doRelease(connection) {
    connection.release(function(err) {
      if (err) {
        console.error(err.message);
      }
    });
  }

  function doRollback(connection) {
    connection.rollback(function(err) {
      if (err) console.log(err.message);
      doRelease(connection);
    });
  }

  function getParams(params) {
    //Parameters:
    let bindVar = '';
    for (let p in params) {
      if (params.hasOwnProperty(p)) {
        bindVar += ` ${p} => :${p},`;
        if (p.toUpperCase() === 'CRETURN') {
          params[p] = {
            type: oracledb.CURSOR,
            dir: oracledb.BIND_OUT
          };
        }
        //table_int parameters
        if (Array.isArray(params[p])) {
          params[p] = {
            type: oracledb.NUMBER,
            dir: oracledb.BIND_IN,
            val: params[p]
          };
        }
        //out parameters
        if (
          typeof params[p] === 'object' &&
          params[p] &&
          params[p].dir === 'out'
        ) {
          params[p] = {
            dir: oracledb.BIND_OUT
          };
        }

        //Change booleans for 1/0
        if (typeof params[p] === 'boolean') {
          params[p] = params[p] ? 1 : 0;
        }
      }
    }

    return {
      params: params,
      bindVar: bindVar.slice(0, -1)
    };
  }

  function getClobData(clob) {
    return new Promise((resolve, reject) => {
      let data = '';
      clob.setEncoding('utf8');
      clob.on('data', clobData => {
        data = clobData;
      });
      clob.on('error', err => {
        reject(err);
      });
      clob.on('end', () => {
        resolve(data);
      });
    });
  }

  function execute(procName, params, columnName) {
    return new Promise((resolve, reject) => {
      getConnection()
        .then(connection => {
          //add the creturn param
          params.creturn = '';
          //Parameters:
          let parameters = getParams(params);
          //Execute:
          connection
            .execute(
              `BEGIN ${procName}(${parameters.bindVar}); END;`,
              parameters.params || {}
            )
            .then(result => {
              let response = {
                meta: result.outBinds.creturn.metaData,
                data: []
              };
              let stream = result.outBinds.creturn.toQueryStream();

              stream.on('data', data => {
                response.data.push(data);
              });

              stream.on('error', error => {
                console.log('stream error: ' + error);
                reject(error);
              });

              stream.on('end', () => {
                if (columnName) {
                  let promises = [];
                  response.data.forEach(item => {
                    let clob = item[columnName];
                    promises.push(getClobData(clob));
                  });
                  Promise.all(promises).then(responses => {
                    response.data.forEach((item, index) => {
                      item[columnName] = responses[index];
                    });
                    doRelease(connection);
                    resolve(response);
                  });
                } else {
                  doRelease(connection);
                  resolve(response);
                }
              });
            })
            .catch(err => {
              if (err) {
                console.error(err.message);
                doRelease(connection);
                return reject(err.message);
              }
            });
        })
        .catch(err => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
        });
    });
  }

  function executeOne(procName, params, columnName) {
    return execute(procName, params, columnName).then(result =>
      result.data.shift()
    );
  }

  function executeNonQuery(procName, params, autoCommit = true) {
    return new Promise((resolve, reject) => {
      getConnection()
        .then(connection => {
          //Parameters:
          let parameters = getParams(params);
          //Execute:
          connection
            .execute(
              `BEGIN ${procName}(${parameters.bindVar}); END;`,
              parameters.params || {},
              {
                autoCommit
              }
            )
            .then(result => {
              const out = new Object();
              for (let p in params) {
                if (
                  params[p] &&
                  (params[p].dir === oracledb.BIND_OUT ||
                    params[p].dir === oracledb.BIND_INOUT)
                ) {
                  out[p] = result.outBinds[p];
                }
              }
              doRelease(connection);
              resolve(out);
            })
            .catch(err => {
              console.log(err);
              let errorCode = err.message.split(':')[0].trim();
              //TODO: CONFLICT must be a const in a config object
              if (errorCode === 'ORA-00001' || errorCode === 'ORA-20001')
                err.code = 'CONFLICT';
              reject(err);
              doRollback(connection);
            });
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  }

  function executeFunction(funcName, params, outMaxSize) {
    return new Promise((resolve, reject) => {
      getConnection().then(connection => {
        let parameters = getParams(params);
        parameters.params.return = {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: outMaxSize || 4000
        };
        connection
          .execute(
            `BEGIN :return := ${funcName}(${parameters.bindVar}); END;`,
            parameters.params || {}
          )
          .then(result => {
            doRelease(connection);
            resolve(result.outBinds.return);
          })
          .catch(err => {
            console.log(err);
            doRelease(connection);
            reject(err);
          });
      });
    });
  }

  function raw() {
    return getConnection().then(connection => {
      return connection;
    });
  }

  return {
    execute,
    executeOne,
    executeNonQuery,
    executeFunction,
    raw
  };
};

module.exports = oracleHelper;
