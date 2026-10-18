const resultadoRepository =
    require('../repositories/resultado.repository');

const cacheGateway =
    require('../gateways/cache.gateway');

const eventBus =
    require('../events/eventBus');

const TTL_RESULTADOS =
    Number(process.env.REDIS_TTL_RESULTADOS) || 60;

const {
    obtenerEstrategia
} = require('../strategies/resultados.strategy');


// =========================================================
// VALIDAR IDS
// =========================================================

function validarId(valor, nombre) {

    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {

        const error = new Error(
            `El identificador de ${nombre} no es válido.`
        );

        error.status = 400;
        error.type = `invalid-${nombre}-id`;

        throw error;
    }

    return id;
}


// =========================================================
// REGISTRAR RESULTADO
// =========================================================

async function registrarResultado(
    votacionId,
    datos,
    usuarioId,
    username
) {

    const votacion = validarId(
        votacionId,
        'election'
    );

    const mesaId = validarId(
        datos.mesaId,
        'table'
    );

    const candidatoId = validarId(
        datos.candidatoId,
        'candidate'
    );

    const votos = Number(datos.votos);


    // Validar votos

    if (
        !Number.isInteger(votos) ||
        votos < 0
    ) {

        const error = new Error(
            'La cantidad de votos debe ser un número entero mayor o igual que cero.'
        );

        error.status = 400;
        error.type = 'invalid-vote-count';

        throw error;
    }


    // Verificar votación

    const existeVotacion =
        await resultadoRepository
            .existeVotacion(votacion);

    if (!existeVotacion) {

        const error = new Error(
            'La votación solicitada no existe.'
        );

        error.status = 404;
        error.type = 'election-not-found';

        throw error;
    }


    // Verificar mesa

    const mesa =
        await resultadoRepository.obtenerMesa(
            votacion,
            mesaId
        );

    if (!mesa) {

        const error = new Error(
            'La mesa no existe o no pertenece a esta votación.'
        );

        error.status = 404;
        error.type = 'table-not-found';

        throw error;
    }


    // Verificar candidato

    const candidato =
        await resultadoRepository
            .obtenerCandidato(
                votacion,
                candidatoId
            );

    if (!candidato) {

        const error = new Error(
            'El candidato no existe o no pertenece a esta votación.'
        );

        error.status = 404;
        error.type = 'candidate-not-found';

        throw error;
    }


    // Evitar duplicados

    const resultadoExistente =
        await resultadoRepository
            .buscarResultado(
                mesaId,
                candidatoId
            );

    if (resultadoExistente) {

        const error = new Error(
            'Ya existe un resultado para este candidato en esta mesa.'
        );

        error.status = 409;
        error.type = 'duplicate-result';

        throw error;
    }


    // Guardar en PostgreSQL

    const resultado =
        await resultadoRepository
            .crearResultado({
                votacionId: votacion,
                mesaId,
                candidatoId,
                votos,
                registradoPor: usuarioId
            });


    // =====================================================
    // INVALIDAR CACHE
    // =====================================================

    const cacheKey =
        `votagt:resultados:votacion:${votacion}`;

    const cacheInvalidada =
    await cacheGateway.eliminar(
        cacheKey
    );

if (cacheInvalidada) {

    console.log(
        `CACHE INVALIDATED → ${cacheKey}`
    );

} else {

    console.warn(
        `CACHE INVALIDATION SKIPPED → ${cacheKey}`
    );
}


    // =====================================================
    // OBSERVER
    // =====================================================

    eventBus.emit(
        'AUDITORIA',
        {
            tipo: 'RESULTADO_REGISTRADO',
            usuarioId,
            username,
            recurso: 'RESULTADO',
            recursoId: resultado.id,
            detalle:
                `Se registraron ${resultado.votos} votos ` +
                `para el candidato ${resultado.candidato_id} ` +
                `en la mesa ${resultado.mesa_id}`
        }
    );


    return resultado;
}



// =========================================================
// CONSULTAR RESULTADO DE UNA MESA + CANDIDATO
// =========================================================

async function obtenerDetalleResultado(
    votacionId,
    datos
) {

    const votacion = validarId(
        votacionId,
        'election'
    );

    const mesaId = validarId(
        datos.mesaId,
        'table'
    );

    const candidatoId = validarId(
        datos.candidatoId,
        'candidate'
    );


    const existeVotacion =
        await resultadoRepository
            .existeVotacion(votacion);

    if (!existeVotacion) {
        const error = new Error(
            'La votación solicitada no existe.'
        );
        error.status = 404;
        error.type = 'election-not-found';
        throw error;
    }


    const mesa =
        await resultadoRepository.obtenerMesa(
            votacion,
            mesaId
        );

    if (!mesa) {
        const error = new Error(
            'La mesa no existe o no pertenece a esta votación.'
        );
        error.status = 404;
        error.type = 'table-not-found';
        throw error;
    }


    const candidato =
        await resultadoRepository.obtenerCandidato(
            votacion,
            candidatoId
        );

    if (!candidato) {
        const error = new Error(
            'El candidato no existe o no pertenece a esta votación.'
        );
        error.status = 404;
        error.type = 'candidate-not-found';
        throw error;
    }


    return await resultadoRepository.obtenerResultado(
        votacion,
        mesaId,
        candidatoId
    ) || null;
}


// =========================================================
// ACTUALIZAR RESULTADO
// =========================================================

async function actualizarResultado(
    votacionId,
    datos,
    usuarioId,
    username
) {

    const votacion = validarId(
        votacionId,
        'election'
    );

    const mesaId = validarId(
        datos.mesaId,
        'table'
    );

    const candidatoId = validarId(
        datos.candidatoId,
        'candidate'
    );

    const votos = Number(datos.votos);


    if (
        !Number.isInteger(votos) ||
        votos < 0
    ) {
        const error = new Error(
            'La cantidad de votos debe ser un número entero mayor o igual que cero.'
        );
        error.status = 400;
        error.type = 'invalid-vote-count';
        throw error;
    }


    const existeVotacion =
        await resultadoRepository
            .existeVotacion(votacion);

    if (!existeVotacion) {
        const error = new Error(
            'La votación solicitada no existe.'
        );
        error.status = 404;
        error.type = 'election-not-found';
        throw error;
    }


    const mesa =
        await resultadoRepository.obtenerMesa(
            votacion,
            mesaId
        );

    if (!mesa) {
        const error = new Error(
            'La mesa no existe o no pertenece a esta votación.'
        );
        error.status = 404;
        error.type = 'table-not-found';
        throw error;
    }


    const candidato =
        await resultadoRepository.obtenerCandidato(
            votacion,
            candidatoId
        );

    if (!candidato) {
        const error = new Error(
            'El candidato no existe o no pertenece a esta votación.'
        );
        error.status = 404;
        error.type = 'candidate-not-found';
        throw error;
    }


    const resultadoAnterior =
        await resultadoRepository.obtenerResultado(
            votacion,
            mesaId,
            candidatoId
        );

    if (!resultadoAnterior) {
        const error = new Error(
            'No existe un resultado registrado para este candidato en esta mesa.'
        );
        error.status = 404;
        error.type = 'result-not-found';
        throw error;
    }


    const votosAnteriores =
        Number(resultadoAnterior.votos);

    const resultado =
        await resultadoRepository.actualizarResultado(
            resultadoAnterior.id,
            votos
        );


    // =====================================================
    // INVALIDAR CACHE
    // =====================================================

    const cacheKey =
        `votagt:resultados:votacion:${votacion}`;

    const cacheInvalidada =
        await cacheGateway.eliminar(cacheKey);

    if (cacheInvalidada) {
        console.log(
            `CACHE INVALIDATED → ${cacheKey}`
        );
    } else {
        console.warn(
            `CACHE INVALIDATION SKIPPED → ${cacheKey}`
        );
    }


    // =====================================================
    // AUDITORIA
    // =====================================================

    eventBus.emit(
        'AUDITORIA',
        {
            tipo: 'RESULTADO_ACTUALIZADO',
            usuarioId,
            username,
            recurso: 'RESULTADO',
            recursoId: resultado.id,
            detalle:
                `Se corrigió el resultado del candidato ${candidatoId} ` +
                `en la mesa ${mesaId}: ` +
                `${votosAnteriores} → ${resultado.votos} votos`
        }
    );


    return {
        ...resultado,
        votos_anteriores: votosAnteriores
    };
}


// =========================================================
// CONSULTAR RESULTADOS
// =========================================================

async function obtenerResultados(votacionId) {

    const votacion = validarId(
        votacionId,
        'election'
    );

    const cacheKey =
        `votagt:resultados:votacion:${votacion}`;


    // =====================================================
    // BUSCAR EN CACHE
    // =====================================================

    const cache =
        await cacheGateway.obtener(
            cacheKey
        );


    // CACHE HIT

    if (cache) {

        console.log(
            `CACHE HIT → ${cacheKey}`
        );

        return {
            ...cache,
            cache: 'HIT'
        };
    }


    // CACHE MISS

    console.log(
        `CACHE MISS → ${cacheKey}`
    );


    // Verificar votación

    const existe =
        await resultadoRepository
            .existeVotacion(votacion);

    if (!existe) {

        const error = new Error(
            'La votación solicitada no existe.'
        );

        error.status = 404;
        error.type = 'election-not-found';

        throw error;
    }


    // Consultar PostgreSQL

    const resultados =
        await resultadoRepository
            .obtenerConsolidado(votacion);

    const resumen =
        await resultadoRepository
            .obtenerResumen(votacion);


    const datos = {

        votacionId: votacion,

        mesasConResultados:
            resumen.mesas_con_resultados,

        totalVotosRegistrados:
            resumen.total_votos_registrados,

        candidatos:
            resultados
    };


    // =====================================================
    // GUARDAR CACHE
    // =====================================================

    const cacheGuardada =
    await cacheGateway.guardar(
        cacheKey,
        datos,
        TTL_RESULTADOS
    );

if (cacheGuardada) {

    console.log(
        `CACHE GUARDADA → ${cacheKey} → TTL ${TTL_RESULTADOS}s`
    );

} else {

    console.warn(
        `CACHE NO DISPONIBLE → ${cacheKey}`
    );
}


    return {
        ...datos,
        cache: 'MISS'
    };
}

// =========================================================
// EXPORTAR RESULTADOS - STRATEGY PATTERN
// =========================================================

async function exportarResultados(
    votacionId,
    formato
) {

    // Reutilizamos la consulta existente.
    // Puede obtener datos desde Redis o PostgreSQL.

    const resultados =
        await obtenerResultados(
            votacionId
        );


    // Seleccionar estrategia

    const estrategia =
        obtenerEstrategia(
            formato
        );


    // Datos que serán exportados

    const datosExportacion = {

        votacionId:
            resultados.votacionId,

        mesasConResultados:
            resultados.mesasConResultados,

        totalVotosRegistrados:
            resultados.totalVotosRegistrados,

        candidatos:
            resultados.candidatos
    };


    // Ejecutar la estrategia seleccionada

    return estrategia.generar(
        datosExportacion
    );
}

module.exports = {
    registrarResultado,
    obtenerDetalleResultado,
    actualizarResultado,
    obtenerResultados,
    exportarResultados
};