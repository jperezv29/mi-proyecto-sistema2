const {
    redisClient
} = require('../config/redis');

const CircuitBreaker =
    require('../patterns/circuitBreaker');


const redisCircuitBreaker =
    new CircuitBreaker({
        nombre: 'Redis',	
        limiteFallos: 3,
        tiempoReintento: 30000
    });


// ==========================================
// VALIDAR REDIS
// ==========================================

async function verificarRedis() {

    if (redisClient.isReady) {
        return;
    }

    if (!redisClient.isOpen) {

        await redisClient.connect();
    }

    if (!redisClient.isReady) {

        throw new Error(
            'Redis no está disponible'
        );
    }
}


// ==========================================
// OBTENER
// ==========================================

async function obtener(clave) {

    return await redisCircuitBreaker
        .ejecutar(

            async () => {

                await verificarRedis();

                const valor =
                    await redisClient.get(
                        clave
                    );

                if (!valor) {
                    return null;
                }

                return JSON.parse(
                    valor
                );
            },

            async () => {

                console.warn(
                    'Redis no disponible. Se usará PostgreSQL.'
                );

                return null;
            }
        );
}


// ==========================================
// GUARDAR
// ==========================================

async function guardar(
    clave,
    datos,
    ttlSegundos
) {

    return await redisCircuitBreaker
        .ejecutar(

            async () => {

                await verificarRedis();

                await redisClient.set(
                    clave,
                    JSON.stringify(datos),
                    {
                        EX: ttlSegundos
                    }
                );

                return true;
            },

            async () => {

                console.warn(
                    'No fue posible guardar la caché.'
                );

                return false;
            }
        );
}


// ==========================================
// ELIMINAR
// ==========================================

async function eliminar(clave) {

    return await redisCircuitBreaker
        .ejecutar(

            async () => {

                await verificarRedis();

                await redisClient.del(
                    clave
                );

                return true;
            },

            async () => {

                console.warn(
                    'No fue posible invalidar la caché.'
                );

                return false;
            }
        );
}


// ==========================================
// EXISTE
// ==========================================

async function existe(clave) {

    return await redisCircuitBreaker
        .ejecutar(

            async () => {

                await verificarRedis();

                const resultado =
                    await redisClient.exists(
                        clave
                    );

                return resultado === 1;
            },

            async () => false
        );
}


// ==========================================
// ESTADO DEL CIRCUIT BREAKER
// ==========================================

function obtenerEstadoCircuito() {

    return redisCircuitBreaker
        .obtenerEstado();
}


module.exports = {
    obtener,
    guardar,
    eliminar,
    existe,
    obtenerEstadoCircuito
};