const {
    createClient
} = require('redis');

require('dotenv').config();


const redisClient = createClient({

    socket: {

        host:
            process.env.REDIS_HOST ||
            '127.0.0.1',

        port:
            Number(
                process.env.REDIS_PORT
            ) || 6379,

        // Evita que Redis bloquee el inicio
        // de toda la API intentando reconectar
        // indefinidamente.
        reconnectStrategy: false
    }
});


redisClient.on(
    'error',
    (error) => {

        console.error(
            'Error en Redis:',
            error.message
        );
    }
);


// ==========================================
// CONECTAR REDIS
// ==========================================

async function conectarRedis() {

    try {

        if (!redisClient.isOpen) {

            await redisClient.connect();
        }

        console.log(
            'Redis conectado correctamente'
        );

        return true;

    } catch (error) {

        console.warn(
            'Redis no disponible al iniciar.'
        );

        return false;
    }
}


module.exports = {
    redisClient,
    conectarRedis
};