const candidatoRepository =
    require('../repositories/candidato.repository');

const eventBus =
    require('../events/eventBus');


// =========================================================
// VALIDAR ID DE VOTACION
// =========================================================

function validarVotacionId(votacionId) {

    const id = Number(votacionId);

    if (!Number.isInteger(id) || id <= 0) {

        const error = new Error(
            'El identificador de la votación no es válido.'
        );

        error.status = 400;
        error.type = 'invalid-election-id';

        throw error;
    }

    return id;
}


// =========================================================
// LISTAR CANDIDATOS
// =========================================================

async function listarCandidatos(votacionId) {

    const id =
        validarVotacionId(votacionId);

    const existe =
        await candidatoRepository
            .existeVotacion(id);

    if (!existe) {

        const error = new Error(
            'La votación solicitada no existe.'
        );

        error.status = 404;
        error.type = 'election-not-found';

        throw error;
    }

    return await candidatoRepository
        .listarPorVotacion(id);
}


// =========================================================
// CREAR CANDIDATO
// =========================================================

async function crearCandidato(
    votacionId,
    datos,
    usuarioId,
    username
) {

    const id =
        validarVotacionId(votacionId);

    const {
        nombre,
        partido,
        cargo,
        numeroLista
    } = datos;


    // Validar campos obligatorios

    if (!nombre || !cargo) {

        const error = new Error(
            'El nombre y el cargo del candidato son obligatorios.'
        );

        error.status = 400;
        error.type = 'validation-error';

        throw error;
    }


    // Verificar votación

    const existe =
        await candidatoRepository
            .existeVotacion(id);

    if (!existe) {

        const error = new Error(
            'La votación solicitada no existe.'
        );

        error.status = 404;
        error.type = 'election-not-found';

        throw error;
    }


    // Validar número de lista

    let numero = null;

    if (
        numeroLista !== undefined &&
        numeroLista !== null
    ) {

        numero = Number(numeroLista);

        if (
            !Number.isInteger(numero) ||
            numero <= 0
        ) {

            const error = new Error(
                'El número de lista debe ser un entero mayor que cero.'
            );

            error.status = 400;
            error.type =
                'invalid-list-number';

            throw error;
        }


        const existente =
            await candidatoRepository
                .buscarNumeroLista(
                    id,
                    numero
                );

        if (existente) {

            const error = new Error(
                'El número de lista ya está asignado a otro candidato en esta votación.'
            );

            error.status = 409;
            error.type =
                'duplicate-list-number';

            throw error;
        }
    }


    // Guardar en PostgreSQL

    const candidato =
        await candidatoRepository
            .crearCandidato({
                votacionId: id,
                nombre: nombre.trim(),
                partido:
                    partido
                        ? partido.trim()
                        : null,
                cargo: cargo.trim(),
                numeroLista: numero
            });


    // =====================================================
    // OBSERVER
    // =====================================================

    eventBus.emit(
        'AUDITORIA',
        {
            tipo: 'CANDIDATO_CREADO',
            usuarioId,
            username,
            recurso: 'CANDIDATO',
            recursoId: candidato.id,
            detalle:
                `Se registró el candidato ${candidato.nombre} en la votación ${id}`
        }
    );


    return candidato;
}


module.exports = {
    listarCandidatos,
    crearCandidato
};