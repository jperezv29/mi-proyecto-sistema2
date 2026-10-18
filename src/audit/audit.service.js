const {
    obtenerMongoDB
} = require('../config/mongodb');


async function registrarEvento({
    tipo,
    usuarioId = null,
    username = null,
    recurso = null,
    recursoId = null,
    detalle = null,
    ip = null
}) {

    try {

        const db = obtenerMongoDB();

        const coleccion =
            db.collection('auditoria');

        await coleccion.insertOne({

            tipo,

            usuarioId,

            username,

            recurso,

            recursoId,

            detalle,

            ip,

            fecha: new Date()

        });

        console.log(
            `AUDITORIA → ${tipo}`
        );

    } catch (error) {

        // La auditoría no debe detener
        // la operación principal.
        console.error(
            'Error registrando auditoría:',
            error.message
        );
    }
}


module.exports = {
    registrarEvento
};