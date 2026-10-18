const mesaRepository =
    require('../repositories/mesa.repository');

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
// LISTAR MESAS
// =========================================================

async function listarMesas(votacionId) {

    const id =
        validarVotacionId(votacionId);

    const existe =
        await mesaRepository.existeVotacion(id);

    if (!existe) {

        const error = new Error(
            'La votación solicitada no existe.'
        );

        error.status = 404;
        error.type = 'election-not-found';

        throw error;
    }

    return await mesaRepository
        .listarPorVotacion(id);
}


// =========================================================
// CREAR MESA
// =========================================================

async function crearMesa(
    votacionId,
    datos,
    usuarioId,
    username
) {

    const id =
        validarVotacionId(votacionId);

    const {
        codigo,
        nombre,
        ubicacion,
        departamento,
        municipio
    } = datos;


    // Validar campos obligatorios

    if (!codigo || !nombre) {

        const error = new Error(
            'El código y el nombre de la mesa son obligatorios.'
        );

        error.status = 400;
        error.type = 'validation-error';

        throw error;
    }


    // Verificar votación

    const existe =
        await mesaRepository.existeVotacion(id);

    if (!existe) {

        const error = new Error(
            'La votación solicitada no existe.'
        );

        error.status = 404;
        error.type = 'election-not-found';

        throw error;
    }


    // Verificar código duplicado

    const existente =
        await mesaRepository.buscarPorCodigo(
            id,
            codigo.trim()
        );

    if (existente) {

        const error = new Error(
            'El código de mesa ya está registrado en esta votación.'
        );

        error.status = 409;
        error.type = 'duplicate-table-code';

        throw error;
    }


    // Guardar en PostgreSQL

    const mesa =
        await mesaRepository.crearMesa({
            votacionId: id,
            codigo: codigo.trim(),
            nombre: nombre.trim(),
            ubicacion:
                ubicacion
                    ? ubicacion.trim()
                    : null,
            departamento:
                departamento
                    ? departamento.trim()
                    : null,
            municipio:
                municipio
                    ? municipio.trim()
                    : null
        });


    // =====================================================
    // OBSERVER
    // =====================================================

    eventBus.emit(
        'AUDITORIA',
        {
            tipo: 'MESA_CREADA',
            usuarioId,
            username,
            recurso: 'MESA',
            recursoId: mesa.id,
            detalle:
                `Se registró la mesa ${mesa.codigo} en la votación ${id}`
        }
    );


    return mesa;
}


module.exports = {
    listarMesas,
    crearMesa
};