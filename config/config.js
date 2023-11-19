const promise = require('bluebird');
const mongoose = require('mongoose')

//Conexión Postgres
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

module.exports = db;

const mongoBd = async () => {

    try {

        const connection = await mongoose.connect('mongodb+srv://admin:admin@cluster0.pqb3kvy.mongodb.net/app-avicola?retryWrites=true&w=majority', {
        })
        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(`MongoDB conectado en: ${url}`)
    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = mongoBd


