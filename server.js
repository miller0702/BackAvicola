const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const logger = require('morgan');
const cors = require('cors');
const mongoBd = require('./config/config');

const users = require('./routes/routes');

const port1 = process.env.PORT || 3000;
const port2 = 3001;  // Cambia a otro puerto según tus necesidades

app.use(logger('dev'));
app.use(express.json());
mongoBd();
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());
app.disable('x-powered-by');
app.set('port', port1);

// Primer puerto
server.listen(port1, '192.168.1.39' || 'localhost', function () {
    console.log('Aplicacion NodeJS id=>' + process.pid + ' puerto=>' + port1 + ' iniciando...');
});

// Segundo puerto
app.listen(port2, '192.168.1.39' || 'localhost', function () {
    console.log('Aplicacion NodeJS id=>' + process.pid + ' puerto=>' + port2 + ' iniciando...');
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
});

users(app);