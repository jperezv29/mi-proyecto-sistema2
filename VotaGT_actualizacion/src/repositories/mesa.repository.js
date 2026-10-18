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

async function listarPorVotacion(votacionId) {
    const resultado = await pool.query(
        `
        SELECT
            id,
            votacion_id,
            codigo,
            nombre,
            ubicacion,
            departamento,
            municipio,
            estado,
            creado_en,
            actualizado_en
        FROM election.mesas
        WHERE votacion_id = $1
        ORDER BY codigo ASC
        `,
        [votacionId]
    );

    return resultado.rows;
}

async function buscarPorCodigo(votacionId, codigo) {
    const resultado = await pool.query(
        `
        SELECT id
        FROM election.mesas
        WHERE votacion_id = $1
          AND codigo = $2
        LIMIT 1
        `,
        [votacionId, codigo]
    );

    return resultado.rows[0];
}

async function crearMesa(datos) {
    const {
        votacionId,
        codigo,
        nombre,
        ubicacion,
        departamento,
        municipio
    } = datos;

    const resultado = await pool.query(
        `
        INSERT INTO election.mesas (
            votacion_id,
            codigo,
            nombre,
            ubicacion,
            departamento,
            municipio
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            votacion_id,
            codigo,
            nombre,
            ubicacion,
            departamento,
            municipio,
            estado,
            creado_en,
            actualizado_en
        `,
        [
            votacionId,
            codigo,
            nombre,
            ubicacion || null,
            departamento || null,
            municipio || null
        ]
    );

    return resultado.rows[0];
}

module.exports = {
    existeVotacion,
    listarPorVotacion,
    buscarPorCodigo,
    crearMesa
};