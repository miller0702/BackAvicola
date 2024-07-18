const mongoose = require('mongoose');

const mongoBd = async () => {
    try {
        const connection = await mongoose.connect('mongodb+srv://admin:admin@cluster0.pqb3kvy.mongodb.net/app-avicola?retryWrites=true&w=majority');

        const url = `${connection.connection.host}:${connection.connection.port}`;
        console.log(`MongoDB conectado en: ${url}`);
    } catch (error) {
        console.error(`Error al conectar con MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = mongoBd;

