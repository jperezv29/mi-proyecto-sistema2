const test = require('node:test');
const assert = require('node:assert/strict');

require('dotenv').config();

const BASE_URL =
    process.env.TEST_BASE_URL ||
    'http://localhost:3000/api/v1';

const TEST_USER =
    process.env.TEST_ADMIN_USER ||
    'admin';

const TEST_PASSWORD =
    process.env.TEST_ADMIN_PASSWORD ||
    'Admin123*';


async function iniciarSesion() {

    const response = await fetch(
        `${BASE_URL}/auth/login`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                identificador: TEST_USER,
                password: TEST_PASSWORD
            })
        }
    );

    assert.equal(
        response.status,
        200
    );

    const body =
        await response.json();

    assert.ok(
        body.token,
        'El login debe devolver un JWT'
    );

    return body.token;
}


// =========================================================
// HEALTH CHECK
// =========================================================

test(
    'GET /health responde 200',
    async () => {

        const response =
            await fetch(
                `${BASE_URL}/health`
            );

        assert.equal(
            response.status,
            200
        );

        const body =
            await response.json();

        assert.equal(
            body.status,
            'OK'
        );
    }
);


// =========================================================
// LOGIN
// =========================================================

test(
    'POST /auth/login devuelve JWT',
    async () => {

        const response =
            await fetch(
                `${BASE_URL}/auth/login`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        identificador:
                            TEST_USER,

                        password:
                            TEST_PASSWORD
                    })
                }
            );

        assert.equal(
            response.status,
            200
        );

        const body =
            await response.json();

        assert.ok(
            body.token
        );
    }
);


// =========================================================
// PERFIL AUTENTICADO
// =========================================================

test(
    'GET /auth/perfil con JWT responde 200',
    async () => {

        const token =
            await iniciarSesion();

        const response =
            await fetch(
                `${BASE_URL}/auth/perfil`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        assert.equal(
            response.status,
            200
        );
    }
);


// =========================================================
// PERFIL SIN JWT
// =========================================================

test(
    'GET /auth/perfil sin JWT responde 401',
    async () => {

        const response =
            await fetch(
                `${BASE_URL}/auth/perfil`
            );

        assert.equal(
            response.status,
            401
        );

        const body =
            await response.json();

        assert.equal(
            body.status,
            401
        );

        assert.ok(
            body.type
        );

        assert.ok(
            body.detail
        );
    }
);


// =========================================================
// LISTAR VOTACIONES
// =========================================================

test(
    'GET /votaciones con JWT responde 200',
    async () => {

        const token =
            await iniciarSesion();

        const response =
            await fetch(
                `${BASE_URL}/votaciones`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        assert.equal(
            response.status,
            200
        );
    }
);


// =========================================================
// VOTACION INEXISTENTE
// =========================================================

test(
    'GET /votaciones/99999 responde 404',
    async () => {

        const token =
            await iniciarSesion();

        const response =
            await fetch(
                `${BASE_URL}/votaciones/99999`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        assert.equal(
            response.status,
            404
        );

        const body =
            await response.json();

        assert.equal(
            body.status,
            404
        );

        assert.ok(
            body.type
        );

        assert.ok(
            body.detail
        );
    }
);