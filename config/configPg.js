const promise = require('bluebird');
const pgp = require('pg-promise')({ promiseLib: promise });

const databaseConfig = {
    host: 'dpg-cqc1p5ij1k6c73fro240-a.oregon-postgres.render.com',
    port: 5432,
    database: 'appavicola',
    user: 'appavicola_admin',
    password: 'oOypCihNG6WZb6mH5o99m6XsO5JFvrN5'
};

const db = pgp(databaseConfig);

module.exports = db;
