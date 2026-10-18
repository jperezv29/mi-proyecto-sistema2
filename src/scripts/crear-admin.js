const bcrypt = require('bcrypt');
const pool = require('../config/database');

async function crearAdministrador() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const username = 'admin';
        const email = 'admin@votagt.local';

        // Contraseña únicamente para desarrollo local.
        const password = 'Admin123*';

        const nombres = 'Administrador';
        const apellidos = 'VotaGT';

        const passwordHash = await bcrypt.hash(password, 12);

        const usuarioExistente = await client.query(
            `
            SELECT id
            FROM auth.usuarios
            WHERE username = $1 OR email = $2
            `,
            [username, email]
        );

        if (usuarioExistente.rows.length > 0) {
            console.log('El usuario administrador ya existe.');
            await client.query('ROLLBACK');
            return;
        }

        const resultadoUsuario = await client.query(
            `
            INSERT INTO auth.usuarios
                (username, email, password_hash, nombres, apellidos)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING id, username, email, estado
            `,
            [
                username,
                email,
                passwordHash,
                nombres,
                apellidos
            ]
        );

        const usuario = resultadoUsuario.rows[0];

        const rol = await client.query(
            `
            SELECT id
            FROM auth.roles
            WHERE nombre = 'ADMINISTRADOR'
            `
        );

        if (rol.rows.length === 0) {
            throw new Error('No existe el rol ADMINISTRADOR.');
        }

        await client.query(
            `
            INSERT INTO auth.usuario_rol
                (usuario_id, rol_id)
            VALUES
                ($1, $2)
            `,
            [usuario.id, rol.rows[0].id]
        );

        await client.query('COMMIT');

        console.log('=================================');
        console.log(' ADMINISTRADOR CREADO');
        console.log('=================================');
        console.log('ID:', usuario.id);
        console.log('Usuario:', usuario.username);
        console.log('Correo:', usuario.email);
        console.log('Estado:', usuario.estado);
        console.log('Rol: ADMINISTRADOR');
        console.log('=================================');

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error creando administrador:');
        console.error(error.message);

    } finally {
        client.release();
        await pool.end();
    }
}

crearAdministrador();