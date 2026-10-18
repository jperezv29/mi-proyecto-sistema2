const votacionRepository =
    require('../repositories/votacion.repository');

const eventBus =
    require('../events/eventBus');


// =========================================================
// LISTAR VOTACIONES
// =========================================================

async function listarVotaciones() {

    return await votacionRepository.listarVotaciones();
}


// =========================================================
// CREAR VOTACION
// =========================================================

async function crearVotacion(
    datos,
    usuarioId,
    username
) {

    const {
        nombre,
        descripcion,
        fechaInicio,
        fechaFin
    } = datos;


    // Validar campos obligatorios

    if (
        !nombre ||
        !fechaInicio ||
        !fechaFin
    ) {

        const error = new Error(
            'Nombre, fecha de inicio y fecha de finalización son obligatorios.'
        );

        error.status = 400;
        error.type = 'validation-error';

        throw error;
    }


    // Convertir fechas

    const inicio =
        new Date(fechaInicio);

    const fin =
        new Date(fechaFin);


    // Validar formato

    if (
        Number.isNaN(inicio.getTime()) ||
        Number.isNaN(fin.getTime())
    ) {

        const error = new Error(
            'Las fechas proporcionadas no son válidas.'
        );

        error.status = 400;
        error.type = 'invalid-date';

        throw error;
    }


    // Validar período

    if (fin <= inicio) {

        const error = new Error(
            'La fecha de finalización debe ser posterior a la fecha de inicio.'
        );

        error.status = 400;
        error.type =
            'invalid-election-period';

        throw error;
    }


    // Guardar en PostgreSQL

    const votacion =
        await votacionRepository.crearVotacion({
            nombre: nombre.trim(),
            descripcion,
            fechaInicio,
            fechaFin,
            creadoPor: usuarioId
        });


    // =====================================================
    // OBSERVER
    // =====================================================

    eventBus.emit(
        'AUDITORIA',
        {
            tipo: 'VOTACION_CREADA',
            usuarioId,
            username,
            recurso: 'VOTACION',
            recursoId: votacion.id,
            detalle:
                `Se creó la votación ${votacion.nombre}`
        }
    );


    return votacion;
}


// =========================================================
// OBTENER VOTACION POR ID
// =========================================================

async function obtenerVotacionPorId(id) {

    if (
        !id ||
        isNaN(id)
    ) {

        const error = new Error(
            'El identificador de la votación no es válido.'
        );

        error.status = 400;
        error.type =
            'invalid-election-id';

        throw error;
    }


    const votacion =
        await votacionRepository
            .obtenerVotacionPorId(id);


    if (!votacion) {

        const error = new Error(
            'La votación solicitada no existe.'
        );

        error.status = 404;
        error.type =
            'election-not-found';

        throw error;
    }


    return votacion;
}


// =========================================================
// ELIMINAR VOTACION
// =========================================================

async function eliminarVotacion(
    id,
    usuarioId,
    username
) {

    // Validar ID
    if (
        !id ||
        isNaN(id)
    ) {

        const error = new Error(
            'El identificador de la votación no es válido.'
        );

        error.status = 400;
        error.type = 'invalid-election-id';

        throw error;
    }


    // Verificar que exista
    const votacion =
        await votacionRepository
            .obtenerVotacionPorId(id);

    if (!votacion) {

        const error = new Error(
            'La votación solicitada no existe.'
        );

        error.status = 404;
        error.type = 'election-not-found';

        throw error;
    }


    try {

        const eliminada =
            await votacionRepository
                .eliminarVotacion(id);


        // =====================================================
        // AUDITORIA
        // =====================================================

        eventBus.emit(
            'AUDITORIA',
            {
                tipo: 'VOTACION_ELIMINADA',
                usuarioId,
                username,
                recurso: 'VOTACION',
                recursoId: votacion.id,
                detalle:
                    `Se eliminó la votación ${votacion.nombre}`
            }
        );


        return eliminada;

    } catch (error) {

        /*
         * PostgreSQL:
         * 23503 = foreign_key_violation
         *
         * Significa que la votación posee información
         * relacionada y no debe eliminarse físicamente.
         */
        if (error.code === '23503') {

            const conflicto = new Error(
                'No se puede eliminar la votación porque posee mesas, candidatos, resultados u otros datos relacionados.'
            );

            conflicto.status = 409;
            conflicto.type =
                'election-has-related-data';

            throw conflicto;
        }

        throw error;
    }
}


module.exports = {
    listarVotaciones,
    crearVotacion,
    obtenerVotacionPorId,
    eliminarVotacion
};