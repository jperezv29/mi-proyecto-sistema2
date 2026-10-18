const pool = require('../config/database');

async function listarUsuarios() {
    const resultado = await pool.query(
        `
        SELECT
            u.id,
            u.username,
            u.email,
            u.nombres,
            u.apellidos,
            u.estado,
            u.intentos_fallidos,
            u.bloqueado_hasta,
            u.ultimo_login,
            u.creado_en,
            u.actualizado_en,
            COALESCE(
                array_agg(DISTINCT r.nombre)
                    FILTER (WHERE r.nombre IS NOT NULL),
                ARRAY[]::text[]
            ) AS roles
        FROM auth.usuarios u
        LEFT JOIN auth.usuario_rol ur
            ON ur.usuario_id = u.id
        LEFT JOIN auth.roles r
            ON r.id = ur.rol_id
        GROUP BY
            u.id,
            u.username,
            u.email,
            u.nombres,
            u.apellidos,
            u.estado,
            u.intentos_fallidos,
            u.bloqueado_hasta,
            u.ultimo_login,
            u.creado_en,
            u.actualizado_en
        ORDER BY u.username ASC
        `
    );

    return resultado.rows;
}

async function obtenerUsuarioPorId(id) {
    const resultado = await pool.query(
        `
        SELECT
            u.id,
            u.username,
            u.email,
            u.nombres,
            u.apellidos,
            u.estado,
            u.intentos_fallidos,
            u.bloqueado_hasta,
            u.ultimo_login,
            u.creado_en,
            u.actualizado_en,
            COALESCE(
                array_agg(DISTINCT r.nombre)
                    FILTER (WHERE r.nombre IS NOT NULL),
                ARRAY[]::text[]
            ) AS roles
        FROM auth.usuarios u
        LEFT JOIN auth.usuario_rol ur
            ON ur.usuario_id = u.id
        LEFT JOIN auth.roles r
            ON r.id = ur.rol_id
        WHERE u.id = $1
        GROUP BY
            u.id,
            u.username,
            u.email,
            u.nombres,
            u.apellidos,
            u.estado,
            u.intentos_fallidos,
            u.bloqueado_hasta,
            u.ultimo_login,
            u.creado_en,
            u.actualizado_en
        `,
        [id]
    );

    return resultado.rows[0];
}

async function listarRoles() {
    const resultado = await pool.query(
        `
        SELECT id, nombre
        FROM auth.roles
        ORDER BY nombre ASC
        `
    );

    return resultado.rows;
}

async function buscarDuplicado(username, email, excluirId = null) {
    const resultado = await pool.query(
        `
        SELECT id, username, email
        FROM auth.usuarios
        WHERE (
            LOWER(username) = LOWER($1)
            OR LOWER(email) = LOWER($2)
        )
        AND ($3::bigint IS NULL OR id <> $3)
        LIMIT 1
        `,
        [username, email, excluirId]
    );

    return resultado.rows[0];
}

async function crearUsuario(datos) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const rol = await client.query(
            `
            SELECT id, nombre
            FROM auth.roles
            WHERE nombre = $1
            LIMIT 1
            `,
            [datos.rol]
        );

        if (rol.rows.length === 0) {
            const error = new Error('El rol solicitado no existe.');
            error.status = 400;
            error.type = 'role-not-found';
            throw error;
        }

        const resultadoUsuario = await client.query(
            `
            INSERT INTO auth.usuarios (
                username,
                email,
                password_hash,
                nombres,
                apellidos,
                estado
            )
            VALUES ($1, $2, $3, $4, $5, 'ACTIVO')
            RETURNING
                id,
                username,
                email,
                nombres,
                apellidos,
                estado,
                intentos_fallidos,
                bloqueado_hasta,
                ultimo_login,
                creado_en,
                actualizado_en
            `,
            [
                datos.username,
                datos.email,
                datos.passwordHash,
                datos.nombres,
                datos.apellidos
            ]
        );

        const usuario = resultadoUsuario.rows[0];

        await client.query(
            `
            INSERT INTO auth.usuario_rol (
                usuario_id,
                rol_id
            )
            VALUES ($1, $2)
            `,
            [usuario.id, rol.rows[0].id]
        );

        await client.query('COMMIT');

        return {
            ...usuario,
            roles: [rol.rows[0].nombre]
        };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function actualizarUsuario(id, datos) {
    const resultado = await pool.query(
        `
        UPDATE auth.usuarios
        SET
            username = $2,
            email = $3,
            nombres = $4,
            apellidos = $5,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
            id,
            username,
            email,
            nombres,
            apellidos,
            estado,
            intentos_fallidos,
            bloqueado_hasta,
            ultimo_login,
            creado_en,
            actualizado_en
        `,
        [
            id,
            datos.username,
            datos.email,
            datos.nombres,
            datos.apellidos
        ]
    );

    return resultado.rows[0];
}

async function cambiarRol(id, nombreRol) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const rol = await client.query(
            `
            SELECT id, nombre
            FROM auth.roles
            WHERE nombre = $1
            LIMIT 1
            `,
            [nombreRol]
        );

        if (rol.rows.length === 0) {
            const error = new Error('El rol solicitado no existe.');
            error.status = 400;
            error.type = 'role-not-found';
            throw error;
        }

        await client.query(
            `
            DELETE FROM auth.usuario_rol
            WHERE usuario_id = $1
            `,
            [id]
        );

        await client.query(
            `
            INSERT INTO auth.usuario_rol (
                usuario_id,
                rol_id
            )
            VALUES ($1, $2)
            `,
            [id, rol.rows[0].id]
        );

        await client.query('COMMIT');

        return rol.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function cambiarEstado(id, estado) {
    const resultado = await pool.query(
        `
        UPDATE auth.usuarios
        SET
            estado = $2,
            intentos_fallidos = CASE
                WHEN $2 = 'ACTIVO' THEN 0
                ELSE intentos_fallidos
            END,
            bloqueado_hasta = CASE
                WHEN $2 = 'ACTIVO' THEN NULL
                WHEN $2 = 'BLOQUEADO' THEN NULL
                ELSE bloqueado_hasta
            END,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING
            id,
            username,
            email,
            nombres,
            apellidos,
            estado,
            intentos_fallidos,
            bloqueado_hasta,
            ultimo_login,
            creado_en,
            actualizado_en
        `,
        [id, estado]
    );

    return resultado.rows[0];
}

module.exports = {
    listarUsuarios,
    obtenerUsuarioPorId,
    listarRoles,
    buscarDuplicado,
    crearUsuario,
    actualizarUsuario,
    cambiarRol,
    cambiarEstado
};
