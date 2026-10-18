const pool = require('../config/database');

async function buscarUsuario(identificador) {
    const resultado = await pool.query(
        `
        SELECT
            id,
            username,
            email,
            password_hash,
            nombres,
            apellidos,
            estado,
            intentos_fallidos,
            bloqueado_hasta
        FROM auth.usuarios
        WHERE username = $1
           OR email = $1
        LIMIT 1
        `,
        [identificador]
    );

    return resultado.rows[0];
}

async function obtenerRoles(usuarioId) {
    const resultado = await pool.query(
        `
        SELECT r.nombre
        FROM auth.usuario_rol ur
        JOIN auth.roles r
            ON r.id = ur.rol_id
        WHERE ur.usuario_id = $1
        `,
        [usuarioId]
    );

    return resultado.rows.map(fila => fila.nombre);
}

async function obtenerPermisos(usuarioId) {
    const resultado = await pool.query(
        `
        SELECT DISTINCT p.codigo
        FROM auth.usuario_rol ur
        JOIN auth.rol_permiso rp
            ON rp.rol_id = ur.rol_id
        JOIN auth.permisos p
            ON p.id = rp.permiso_id
        WHERE ur.usuario_id = $1
        ORDER BY p.codigo
        `,
        [usuarioId]
    );

    return resultado.rows.map(fila => fila.codigo);
}

async function registrarIntentoFallido(usuarioId) {
    const resultado = await pool.query(
        `
        UPDATE auth.usuarios
        SET
            intentos_fallidos = intentos_fallidos + 1,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING intentos_fallidos
        `,
        [usuarioId]
    );

    return resultado.rows[0].intentos_fallidos;
}

async function bloquearUsuario(usuarioId) {
    await pool.query(
        `
        UPDATE auth.usuarios
        SET
            estado = 'BLOQUEADO',
            bloqueado_hasta = CURRENT_TIMESTAMP + INTERVAL '15 minutes',
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [usuarioId]
    );
}

async function desbloquearUsuario(usuarioId) {
    await pool.query(
        `
        UPDATE auth.usuarios
        SET
            estado = 'ACTIVO',
            intentos_fallidos = 0,
            bloqueado_hasta = NULL,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [usuarioId]
    );
}

async function registrarLoginExitoso(usuarioId) {
    await pool.query(
        `
        UPDATE auth.usuarios
        SET
            intentos_fallidos = 0,
            bloqueado_hasta = NULL,
            ultimo_login = CURRENT_TIMESTAMP,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [usuarioId]
    );
}

module.exports = {
    buscarUsuario,
    obtenerRoles,
    obtenerPermisos,
    registrarIntentoFallido,
    bloquearUsuario,
    desbloquearUsuario,
    registrarLoginExitoso
};