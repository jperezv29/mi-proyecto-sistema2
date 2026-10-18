const neo4j = require('neo4j-driver');
require('dotenv').config();

const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://127.0.0.1:7687',
    neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD
    )
);

async function conectarNeo4j() {

    await driver.verifyConnectivity();

    console.log(
        'Neo4j conectado correctamente'
    );
}

function obtenerDriverNeo4j() {
    return driver;
}

module.exports = {
    conectarNeo4j,
    obtenerDriverNeo4j
};