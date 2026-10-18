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
            c.id,
            c.votacion_id,
            c.nombre,
            c.partido,
            c.cargo,
            c.numero_lista,
            c.estado,
            c.creado_en,
            c.actualizado_en
        FROM election.candidatos c
        WHERE c.votacion_id = $1
        ORDER BY c.numero_lista ASC, c.nombre ASC
        `,
        [votacionId]
    );

    return resultado.rows;
}

async function buscarNumeroLista(votacionId, numeroLista) {

    const resultado = await pool.query(
        `
        SELECT id
        FROM election.candidatos
        WHERE votacion_id = $1
          AND numero_lista = $2
        LIMIT 1
        `,
        [votacionId, numeroLista]
    );

    return resultado.rows[0];
}

async function crearCandidato(datos) {

    const {
        votacionId,
        nombre,
        partido,
        cargo,
        numeroLista
    } = datos;

    const resultado = await pool.query(
        `
        INSERT INTO election.candidatos (
            votacion_id,
            nombre,
            partido,
            cargo,
            numero_lista
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            votacion_id,
            nombre,
            partido,
            cargo,
            numero_lista,
            estado,
            creado_en,
            actualizado_en
        `,
        [
            votacionId,
            nombre,
            partido || null,
            cargo,
            numeroLista || null
        ]
    );

    return resultado.rows[0];
}

module.exports = {
    existeVotacion,
    listarPorVotacion,
    buscarNumeroLista,
    crearCandidato
};