const pool = require('../config/database');

async function existeVotacion(votacionId) {
    const resultado = await pool.query(
        `
        SELECT id
        FROM election.votaciones
        WHERE id = $1
        `,
        [votacionId]
    );

    return resultado.rows.length > 0;
}

async function obtenerMesa(votacionId, mesaId) {
    const resultado = await pool.query(
        `
        SELECT id, codigo, estado
        FROM election.mesas
        WHERE id = $1
          AND votacion_id = $2
        `,
        [mesaId, votacionId]
    );

    return resultado.rows[0];
}

async function obtenerCandidato(votacionId, candidatoId) {
    const resultado = await pool.query(
        `
        SELECT id, nombre, estado
        FROM election.candidatos
        WHERE id = $1
          AND votacion_id = $2
        `,
        [candidatoId, votacionId]
    );

    return resultado.rows[0];
}

async function buscarResultado(mesaId, candidatoId) {
    const resultado = await pool.query(
        `
        SELECT id
        FROM election.resultados
        WHERE mesa_id = $1
          AND candidato_id = $2
        LIMIT 1
        `,
        [mesaId, candidatoId]
    );

    return resultado.rows[0];
}


async function obtenerResultado(votacionId, mesaId, candidatoId) {
    const resultado = await pool.query(
        `
        SELECT
            id,
            votacion_id,
            mesa_id,
            candidato_id,
            votos,
            registrado_por,
            creado_en,
            actualizado_en
        FROM election.resultados
        WHERE votacion_id = $1
          AND mesa_id = $2
          AND candidato_id = $3
        LIMIT 1
        `,
        [votacionId, mesaId, candidatoId]
    );

    return resultado.rows[0];
}

async function actualizarResultado(resultadoId, votos) {
    const resultado = await pool.query(
        `
        UPDATE election.resultados
        SET
            votos = $2,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
            id,
            votacion_id,
            mesa_id,
            candidato_id,
            votos,
            registrado_por,
            creado_en,
            actualizado_en
        `,
        [resultadoId, votos]
    );

    return resultado.rows[0];
}

async function crearResultado(datos) {
    const {
        votacionId,
        mesaId,
        candidatoId,
        votos,
        registradoPor
    } = datos;

    const resultado = await pool.query(
        `
        INSERT INTO election.resultados (
            votacion_id,
            mesa_id,
            candidato_id,
            votos,
            registrado_por
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            votacion_id,
            mesa_id,
            candidato_id,
            votos,
            registrado_por,
            creado_en,
            actualizado_en
        `,
        [
            votacionId,
            mesaId,
            candidatoId,
            votos,
            registradoPor
        ]
    );

    return resultado.rows[0];
}

async function obtenerConsolidado(votacionId) {
    const resultado = await pool.query(
        `
        SELECT
            c.id AS candidato_id,
            c.numero_lista,
            c.nombre,
            c.partido,
            COALESCE(SUM(r.votos), 0)::BIGINT AS total_votos
        FROM election.candidatos c
        LEFT JOIN election.resultados r
            ON r.candidato_id = c.id
           AND r.votacion_id = c.votacion_id
        WHERE c.votacion_id = $1
        GROUP BY
            c.id,
            c.numero_lista,
            c.nombre,
            c.partido
        ORDER BY total_votos DESC, c.numero_lista ASC
        `,
        [votacionId]
    );

    return resultado.rows;
}

async function obtenerResumen(votacionId) {
    const resultado = await pool.query(
        `
        SELECT
            COUNT(DISTINCT mesa_id)::INTEGER AS mesas_con_resultados,
            COALESCE(SUM(votos), 0)::BIGINT AS total_votos_registrados
        FROM election.resultados
        WHERE votacion_id = $1
        `,
        [votacionId]
    );

    return resultado.rows[0];
}

module.exports = {
    existeVotacion,
    obtenerMesa,
    obtenerCandidato,
    buscarResultado,
    obtenerResultado,
    actualizarResultado,
    crearResultado,
    obtenerConsolidado,
    obtenerResumen
};