const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri =
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017';

const client = new MongoClient(uri);

let database = null;

async function conectarMongo() {

    if (!database) {

        await client.connect();

        database = client.db(
            process.env.MONGO_DB || 'votagt_audit'
        );

        console.log(
            'MongoDB conectado correctamente'
        );
    }

    return database;
}

function obtenerMongoDB() {

    if (!database) {
        throw new Error(
            'MongoDB todavía no ha sido inicializado.'
        );
    }

    return database;
}

module.exports = {
    conectarMongo,
    obtenerMongoDB
};