
const mongoose = require('mongoose')

//Conexión Postgres


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


