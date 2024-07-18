const promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: promise });
require('dotenv').config();

const databaseConfig = {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: {
        rejectUnauthorized: false 
    }
};

const db = pgp(databaseConfig);

module.exports = db;
