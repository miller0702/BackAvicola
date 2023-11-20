const promise = require('bluebird');

const options = {
    promiseLib: promise,
    query: (e) => {}
};

const pgp = require('pg-promise')(options);
const type = pgp.pg.types;
type.setTypeParser(1114, function (stringValue) {
    return stringValue;
});

const databaseConfig = {
    'host': 'monorail.proxy.rlwy.net',
    'port': 37683,
    'database': 'railway',
    'user': 'postgres',
    'password': '3BBG6Fd6*d2DDb1e6F1CDaE15g13c1gb'
};

const db = pgp(databaseConfig);
console.log(db.manyOrNone)
module.exports = db;