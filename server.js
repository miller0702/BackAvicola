const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const logger = require('morgan');
const cors = require('cors');
const mongoBd = require('./config/config');
const configPg = require('./config/configPg');
const users = require('./routes/routes');

const port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.disable('x-powered-by');
app.set('port', port);


mongoBd().then(() => {
    https.createServer(options, app).listen(port, () => {
        console.log(`Aplicación NodeJS iniciada en el puerto ${port} (HTTPS)`);
    });
}).catch(err => {
    console.error(`Error al iniciar MongoDB: ${err.message}`);
    process.exit(1);
});

app.options('*', cors());

users(app);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Error interno');
});
