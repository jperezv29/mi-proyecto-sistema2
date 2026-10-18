// ==========================================
// Variables de entorno
// ==========================================

require('dotenv').config();


// ==========================================
// Dependencias
// ==========================================

const path = require('path');
const express = require('express');
const cors = require('cors');


// ==========================================
// Configuración de bases de datos
// ==========================================

const pool = require('./config/database');

const {
    conectarRedis
} = require('./config/redis');

const {
    conectarMongo
} = require('./config/mongodb');

const {
    conectarNeo4j
} = require('./config/neo4j');


// ==========================================
// Observer de auditoría
// ==========================================

require('./events/audit.observer');


// ==========================================
// Rutas
// ==========================================

const authRoutes =
    require('./routes/auth.routes');

const votacionRoutes =
    require('./routes/votacion.routes');

const candidatoRoutes =
    require('./routes/candidato.routes');

const mesaRoutes =
    require('./routes/mesa.routes');

const resultadoRoutes =
    require('./routes/resultado.routes');

const usuarioRoutes =
    require('./routes/usuario.routes');


// ==========================================
// Middleware de errores
// ==========================================

const errorHandler =
    require('./middlewares/errorHandler');


// ==========================================
// Aplicación Express
// ==========================================

const app = express();


// ==========================================
// Estado de servicios
// ==========================================

let redisConectado = false;


// ==========================================
// Middlewares generales
// ==========================================

app.use(cors());
app.use(express.json());


// ==========================================
// Frontend web
// ==========================================

app.use(
    express.static(
        path.join(__dirname, '..', 'public')
    )
);


// ==========================================
// Health Check
// ==========================================

app.get(
    '/api/v1/health',
    async (req, res) => {
        try {
            await pool.query('SELECT 1');

            res.status(200).json({
                status: 'OK',
                api: 'VotaGT',
                database: 'CONNECTED',
                redis: redisConectado
                    ? 'CONNECTED'
                    : 'DEGRADED'
            });

        } catch (error) {
            res.status(503).json({
                status: 'ERROR',
                api: 'VotaGT',
                database: 'DISCONNECTED',
                redis: redisConectado
                    ? 'CONNECTED'
                    : 'DEGRADED'
            });
        }
    }
);


// ==========================================
// Rutas de autenticación
// ==========================================

app.use(
    '/api/v1/auth',
    authRoutes
);


// ==========================================
// Rutas administrativas de usuarios
// ==========================================

app.use(
    '/api/v1/usuarios',
    usuarioRoutes
);


// ==========================================
// Rutas de votaciones
// ==========================================

app.use(
    '/api/v1/votaciones',
    votacionRoutes
);


// ==========================================
// Rutas de candidatos
// ==========================================

app.use(
    '/api/v1/votaciones/:votacionId/candidatos',
    candidatoRoutes
);


// ==========================================
// Rutas de mesas
// ==========================================

app.use(
    '/api/v1/votaciones/:votacionId/mesas',
    mesaRoutes
);


// ==========================================
// Rutas de resultados
// ==========================================

app.use(
    '/api/v1/votaciones/:votacionId/resultados',
    resultadoRoutes
);


// ==========================================
// Manejo global de errores
// ==========================================

app.use(errorHandler);


// ==========================================
// Puerto
// ==========================================

const PORT =
    process.env.PORT || 3000;


// ==========================================
// Inicio del servidor
// ==========================================

async function iniciarServidor() {
    try {
        // ----------------------------------
        // PostgreSQL
        // ----------------------------------

        await pool.query('SELECT 1');

        console.log('PostgreSQL: CONNECTED');


        // ----------------------------------
        // Redis
        // ----------------------------------

        redisConectado =
            await conectarRedis();

        console.log(
            `Redis: ${
                redisConectado
                    ? 'CONNECTED'
                    : 'DEGRADED'
            }`
        );


        // ----------------------------------
        // MongoDB
        // ----------------------------------

        await conectarMongo();

        console.log('MongoDB: CONNECTED');


        // ----------------------------------
        // Neo4j
        // ----------------------------------

        await conectarNeo4j();

        console.log('Neo4j: CONNECTED');


        // ----------------------------------
        // Servidor HTTP
        // ----------------------------------

        app.listen(
            PORT,
            () => {
                console.log('=================================');
                console.log(' API VotaGT iniciada');
                console.log('=================================');
                console.log(`Web: http://localhost:${PORT}`);
                console.log(`Health: http://localhost:${PORT}/api/v1/health`);
                console.log(`Login: POST http://localhost:${PORT}/api/v1/auth/login`);
                console.log(`Usuarios: GET http://localhost:${PORT}/api/v1/usuarios`);
                console.log('=================================');
            }
        );

    } catch (error) {
        console.error(
            'No fue posible iniciar la aplicación:',
            error.message
        );

        process.exit(1);
    }
}


// ==========================================
// Ejecutar aplicación
// ==========================================

iniciarServidor();
