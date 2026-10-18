const pool = require('./database');

async function probarConexion() {
    try {
        const resultado = await pool.query(`
            SELECT
                current_database() AS base_datos,
                current_user AS usuario,
                NOW() AS fecha_servidor
        `);

        console.log('=================================');
        console.log(' CONEXIÓN POSTGRESQL EXITOSA');
        console.log('=================================');
        console.log('Base de datos:', resultado.rows[0].base_datos);
        console.log('Usuario:', resultado.rows[0].usuario);
        console.log('Servidor:', resultado.rows[0].fecha_servidor);
        console.log('=================================');

    } catch (error) {

        console.error('=================================');
        console.error(' ERROR DE CONEXIÓN');
        console.error('=================================');
        console.error(error.message);

    } finally {

        await pool.end();
    }
}

probarConexion();