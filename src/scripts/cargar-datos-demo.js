/*
 * VotaGT - Cargador rápido de datos demo
 * Usa la API REST actual del proyecto.
 * Requisitos:
 *   1) npm run dev debe estar ejecutándose
 *   2) Usuario admin disponible
 *   3) Node.js 18+ (tu proyecto usa Node 24)
 *
 * Ejecutar:
 *   node src/scripts/cargar-datos-demo.js
 */

const API = process.env.VOTAGT_API || 'http://localhost:3000/api/v1';
const ADMIN_USER = process.env.VOTAGT_USER || 'admin';
const ADMIN_PASS = process.env.VOTAGT_PASS || 'Admin123*';

const RUN_ID = String(Date.now()).slice(-6);

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function unwrap(payload) {
    if (payload == null) return payload;
    if (payload.datos !== undefined) return payload.datos;
    if (payload.data !== undefined) return payload.data;
    if (payload.result !== undefined) return payload.result;
    return payload;
}

function getId(obj) {
    if (!obj || typeof obj !== 'object') return null;

    const candidates = [
        obj.id,
        obj.votacionId,
        obj.votacion_id,
        obj.idVotacion,
        obj.id_votacion,
        obj.mesaId,
        obj.mesa_id,
        obj.idMesa,
        obj.id_mesa,
        obj.candidatoId,
        obj.candidato_id,
        obj.idCandidato,
        obj.id_candidato
    ];

    for (const value of candidates) {
        const n = Number(value);
        if (Number.isInteger(n) && n > 0) return n;
    }

    return null;
}

async function request(path, options = {}, token = '') {
    const headers = {
        Accept: 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let body = options.body;

    if (body !== undefined && body !== null && typeof body !== 'string') {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
    }

    const response = await fetch(API + path, {
        ...options,
        headers,
        body
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('json')
        ? await response.json().catch(() => null)
        : await response.text().catch(() => '');

    if (!response.ok) {
        const message =
            payload?.detail ||
            payload?.message ||
            payload?.error ||
            payload?.title ||
            payload?.type ||
            (typeof payload === 'string' ? payload : '') ||
            `HTTP ${response.status}`;

        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
}

const elecciones = [
    {
        nombre: `Elección Municipal Metropolitana 2027 - Demo ${RUN_ID}`,
        descripcion: 'Proceso electoral de demostración para alcaldía municipal y validación funcional de VotaGT.',
        fechaInicio: '2027-03-14T07:00:00-06:00',
        fechaFin: '2027-03-14T18:00:00-06:00',
        departamento: 'Guatemala',
        municipio: 'Guatemala',
        cargo: 'Alcalde Municipal',
        candidatos: [
            ['Carlos Alejandro Méndez López', 'Movimiento Ciudadano Nacional', 1],
            ['María Fernanda Castillo Reyes', 'Alianza por el Desarrollo', 2],
            ['José Roberto Morales Díaz', 'Fuerza Comunitaria', 3],
            ['Andrea Lucía Herrera Gómez', 'Renovación Democrática', 4]
        ],
        mesas: [
            ['001', 'Mesa Central 01', 'Escuela Oficial Urbana No. 12, Zona 1'],
            ['002', 'Mesa Central 02', 'Instituto Nacional Central, Zona 1'],
            ['003', 'Mesa Zona 5', 'Escuela República de México, Zona 5'],
            ['004', 'Mesa Zona 7', 'Instituto Rafael Aqueche, Zona 7'],
            ['005', 'Mesa Zona 11', 'Centro Educativo Metropolitano, Zona 11'],
            ['006', 'Mesa Zona 12', 'Escuela Tipo Federación, Zona 12']
        ]
    },
    {
        nombre: `Elección Municipal Mixco 2027 - Demo ${RUN_ID}`,
        descripcion: 'Datos ficticios de prueba para mesas, candidatos y consolidado de resultados.',
        fechaInicio: '2027-04-18T07:00:00-06:00',
        fechaFin: '2027-04-18T18:00:00-06:00',
        departamento: 'Guatemala',
        municipio: 'Mixco',
        cargo: 'Alcalde Municipal',
        candidatos: [
            ['Luis Fernando García Soto', 'Unión Vecinal', 1],
            ['Paola Jimena Ramírez Cruz', 'Proyecto Ciudadano', 2],
            ['Edgar Antonio López Pineda', 'Frente Metropolitano', 3],
            ['Sofía Daniela Ortiz Molina', 'Acción Local', 4]
        ],
        mesas: [
            ['101', 'Mesa Mixco 01', 'Escuela Oficial Zona 1 de Mixco'],
            ['102', 'Mesa Mixco 02', 'Instituto Municipal de Mixco'],
            ['103', 'Mesa El Milagro', 'Centro Educativo El Milagro'],
            ['104', 'Mesa San Cristóbal', 'Instituto San Cristóbal'],
            ['105', 'Mesa Minerva', 'Escuela Colonia Minerva']
        ]
    },
    {
        nombre: `Elección de Representantes Estudiantiles 2026 - Demo ${RUN_ID}`,
        descripcion: 'Proceso interno ficticio para demostrar el funcionamiento integral del sistema.',
        fechaInicio: '2026-11-21T08:00:00-06:00',
        fechaFin: '2026-11-21T16:00:00-06:00',
        departamento: 'Guatemala',
        municipio: 'Guatemala',
        cargo: 'Representante Estudiantil',
        candidatos: [
            ['Daniel Estuardo Pérez López', 'Plan Innovación', 1],
            ['Gabriela Alejandra Ruiz Morales', 'Impulso Estudiantil', 2],
            ['Kevin Mauricio Hernández Soto', 'Compromiso Universitario', 3]
        ],
        mesas: [
            ['201', 'Mesa Facultad 01', 'Edificio A, primer nivel'],
            ['202', 'Mesa Facultad 02', 'Edificio B, segundo nivel'],
            ['203', 'Mesa Facultad 03', 'Biblioteca Central'],
            ['204', 'Mesa Facultad 04', 'Laboratorios de Computación']
        ]
    }
];

async function main() {
    console.log('==============================================');
    console.log(' VotaGT - CARGA RÁPIDA DE DATOS DEMO');
    console.log('==============================================');
    console.log(`API: ${API}`);
    console.log(`Usuario: ${ADMIN_USER}`);
    console.log(`Identificador de corrida: ${RUN_ID}`);
    console.log('');

    console.log('1. Iniciando sesión...');
    const loginPayload = await request('/auth/login', {
        method: 'POST',
        body: {
            identificador: ADMIN_USER,
            password: ADMIN_PASS
        }
    });

    const login = unwrap(loginPayload) || loginPayload || {};
    const token = login.token || loginPayload?.token;

    if (!token) {
        throw new Error('El login no devolvió un JWT.');
    }

    console.log('   ✓ Sesión iniciada.');
    console.log('');

    let totalVotaciones = 0;
    let totalMesas = 0;
    let totalCandidatos = 0;
    let totalResultados = 0;

    for (const eleccion of elecciones) {
        console.log(`Creando votación: ${eleccion.nombre}`);

        const vPayload = await request('/votaciones', {
            method: 'POST',
            body: {
                nombre: eleccion.nombre,
                descripcion: eleccion.descripcion,
                fechaInicio: eleccion.fechaInicio,
                fechaFin: eleccion.fechaFin
            }
        }, token);

        const votacion = unwrap(vPayload);
        const votacionId = getId(votacion);

        if (!votacionId) {
            throw new Error(`No fue posible obtener el ID de la votación "${eleccion.nombre}".`);
        }

        totalVotaciones++;
        console.log(`   ✓ Votación ID ${votacionId}`);

        const candidatosCreados = [];

        for (const [nombre, partido, numeroLista] of eleccion.candidatos) {
            const cPayload = await request(
                `/votaciones/${votacionId}/candidatos`,
                {
                    method: 'POST',
                    body: {
                        nombre,
                        partido,
                        cargo: eleccion.cargo,
                        numeroLista
                    }
                },
                token
            );

            const candidato = unwrap(cPayload);
            const candidatoId = getId(candidato);

            if (!candidatoId) {
                throw new Error(`No se obtuvo ID para candidato ${nombre}.`);
            }

            candidatosCreados.push({
                id: candidatoId,
                nombre
            });

            totalCandidatos++;
            console.log(`     ✓ Candidato: ${nombre}`);
        }

        const mesasCreadas = [];

        for (const [numero, nombre, ubicacion] of eleccion.mesas) {
            const codigo = `DEMO-${RUN_ID}-${numero}`;

            const mPayload = await request(
                `/votaciones/${votacionId}/mesas`,
                {
                    method: 'POST',
                    body: {
                        codigo,
                        nombre,
                        ubicacion,
                        departamento: eleccion.departamento,
                        municipio: eleccion.municipio
                    }
                },
                token
            );

            const mesa = unwrap(mPayload);
            const mesaId = getId(mesa);

            if (!mesaId) {
                throw new Error(`No se obtuvo ID para mesa ${nombre}.`);
            }

            mesasCreadas.push({
                id: mesaId,
                nombre
            });

            totalMesas++;
            console.log(`     ✓ Mesa: ${nombre}`);
        }

        console.log('   Generando resultados aleatorios...');

        for (const mesa of mesasCreadas) {
            // Genera un "nivel de participación" distinto por mesa.
            const factorMesa = randomInt(75, 115) / 100;

            for (let i = 0; i < candidatosCreados.length; i++) {
                const candidato = candidatosCreados[i];

                // Los primeros candidatos tienden a tener algo más de votos,
                // pero sigue existiendo variación aleatoria.
                const base = Math.max(
                    15,
                    150 - (i * 22)
                );

                const votos = Math.round(
                    randomInt(
                        Math.max(10, base - 55),
                        base + 55
                    ) * factorMesa
                );

                await request(
                    `/votaciones/${votacionId}/resultados`,
                    {
                        method: 'POST',
                        body: {
                            mesaId: mesa.id,
                            candidatoId: candidato.id,
                            votos
                        }
                    },
                    token
                );

                totalResultados++;
            }
        }

        console.log(`   ✓ Resultados cargados para ${mesasCreadas.length} mesas.`);
        console.log('');
    }

    console.log('==============================================');
    console.log(' CARGA COMPLETADA');
    console.log('==============================================');
    console.log(`Votaciones:  ${totalVotaciones}`);
    console.log(`Mesas:       ${totalMesas}`);
    console.log(`Candidatos:  ${totalCandidatos}`);
    console.log(`Resultados:  ${totalResultados}`);
    console.log('==============================================');
    console.log('');
    console.log('Abre VotaGT y actualiza el navegador con Ctrl + F5.');
}

main().catch(error => {
    console.error('');
    console.error('==============================================');
    console.error(' ERROR DURANTE LA CARGA');
    console.error('==============================================');
    console.error(error.message);

    if (error.status) {
        console.error('HTTP:', error.status);
    }

    if (error.payload) {
        console.error(
            'Respuesta:',
            JSON.stringify(error.payload, null, 2)
        );
    }

    process.exit(1);
});
