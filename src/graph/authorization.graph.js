const {
    obtenerDriverNeo4j
} = require('../config/neo4j');


async function sincronizarAutorizacion({
    usuarioId,
    username,
    roles,
    permisos
}) {

    const driver =
        obtenerDriverNeo4j();

    const session =
        driver.session();

    try {

        // Crear o actualizar usuario

        await session.run(
            `
            MERGE (u:Usuario {id: $usuarioId})
            SET u.username = $username
            `,
            {
                usuarioId: String(usuarioId),
                username
            }
        );


        // Limpiar relaciones de rol anteriores del usuario.
        // Esto evita que Neo4j conserve un rol viejo cuando
        // el administrador cambia la asignación en PostgreSQL.

        await session.run(
            `
                MATCH (u:Usuario {id: $usuarioId})
                      -[rel:TIENE_ROL]->(:Rol)
                DELETE rel
            `,
            {
                usuarioId: String(usuarioId)
            }
        );


        // Crear roles y relaciones actuales

        for (const rol of roles) {

            await session.run(
                `
                MATCH (u:Usuario {id: $usuarioId})

                MERGE (r:Rol {nombre: $rol})

                MERGE (u)-[:TIENE_ROL]->(r)
                `,
                {
                    usuarioId: String(usuarioId),
                    rol
                }
            );
        }


        // Para este proyecto el JWT ya contiene
        // los permisos efectivos del usuario.
        // Los relacionamos con sus roles.

        for (const permiso of permisos) {

            await session.run(
                `
                MATCH (u:Usuario {id: $usuarioId})
                      -[:TIENE_ROL]->(r:Rol)

                MERGE (p:Permiso {codigo: $permiso})

                MERGE (r)-[:OTORGA]->(p)
                `,
                {
                    usuarioId: String(usuarioId),
                    permiso
                }
            );
        }


        console.log(
            `NEO4J SYNC → ${username}`
        );

    } finally {

        await session.close();
    }
}


async function obtenerGrafoUsuario(
    usuarioId
) {

    const driver =
        obtenerDriverNeo4j();

    const session =
        driver.session();

    try {

        const resultado =
            await session.run(
                `
                MATCH
                    (u:Usuario {id: $usuarioId})
                    -[:TIENE_ROL]->(r:Rol)
                    -[:OTORGA]->(p:Permiso)

                RETURN
                    u.username AS username,
                    collect(
                        DISTINCT r.nombre
                    ) AS roles,
                    collect(
                        DISTINCT p.codigo
                    ) AS permisos
                `,
                {
                    usuarioId:
                        String(usuarioId)
                }
            );


        if (
            resultado.records.length === 0
        ) {
            return null;
        }


        const registro =
            resultado.records[0];


        return {

            username:
                registro.get('username'),

            roles:
                registro.get('roles'),

            permisos:
                registro.get('permisos')
        };

    } finally {

        await session.close();
    }
}


module.exports = {
    sincronizarAutorizacion,
    obtenerGrafoUsuario
};