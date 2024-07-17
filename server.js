const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const logger = require('morgan');
const cors = require('cors');
const mongoBd = require('./config/config');
const configPg = require('./config/configPg');
const users = require('./routes/routes');

const port1 = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.disable('x-powered-by');
app.set('port', port1);

mongoBd().then(() => {

    server.listen(port1,  () => {
        console.log(`Aplicación NodeJS iniciada en el puerto ${port1}`);
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
