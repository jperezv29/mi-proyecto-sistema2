const pool = require('../config/database');

async function listarVotaciones() {

    const resultado = await pool.query(
        `
        SELECT
            v.id,
            v.nombre,
            v.descripcion,
            v.fecha_inicio,
            v.fecha_fin,
            v.estado,
            v.creado_en,
            v.actualizado_en,
            u.id AS creador_id,
            u.username AS creador_username
        FROM election.votaciones v
        JOIN auth.usuarios u
            ON u.id = v.creado_por
        ORDER BY v.fecha_inicio DESC
        `
    );

    return resultado.rows;
}

async function crearVotacion(datos) {

    const {
        nombre,
        descripcion,
        fechaInicio,
        fechaFin,
        creadoPor
    } = datos;

    const resultado = await pool.query(
        `
        INSERT INTO election.votaciones (
            nombre,
            descripcion,
            fecha_inicio,
            fecha_fin,
            creado_por
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            nombre,
            descripcion,
            fecha_inicio,
            fecha_fin,
            estado,
            creado_por,
            creado_en,
            actualizado_en
        `,
        [
            nombre,
            descripcion || null,
            fechaInicio,
            fechaFin,
            creadoPor
        ]
    );

    return resultado.rows[0];
}

async function obtenerVotacionPorId(id) {

    const resultado = await pool.query(
        `
        SELECT
            v.id,
            v.nombre,
            v.descripcion,
            v.fecha_inicio,
            v.fecha_fin,
            v.estado,
            v.creado_en,
            v.actualizado_en,
            u.id AS creador_id,
            u.username AS creador_username
        FROM election.votaciones v
        JOIN auth.usuarios u
            ON u.id = v.creado_por
        WHERE v.id = $1
        `,
        [id]
    );

    return resultado.rows[0];
}


// =========================================================
// ELIMINAR VOTACION
// =========================================================

async function eliminarVotacion(id) {

    const resultado = await pool.query(
        `
        DELETE FROM election.votaciones
        WHERE id = $1
        RETURNING
            id,
            nombre,
            descripcion,
            fecha_inicio,
            fecha_fin,
            estado
        `,
        [id]
    );

    return resultado.rows[0];
}


module.exports = {
    listarVotaciones,
    crearVotacion,
    obtenerVotacionPorId,
    eliminarVotacion
};