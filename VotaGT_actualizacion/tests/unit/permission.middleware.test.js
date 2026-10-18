const test = require('node:test');
const assert = require('node:assert/strict');

const {
    requierePermiso
} = require('../../src/middlewares/permission.middleware');


// =========================================================
// USUARIO CON PERMISO
// =========================================================

test(
    'Permite continuar cuando el usuario posee el permiso',
    () => {

        const middleware =
            requierePermiso('VOTACIONES_GESTIONAR');

        const req = {
            usuario: {
                permisos: [
                    'VOTACIONES_GESTIONAR',
                    'RESULTADOS_CONSULTAR'
                ]
            }
        };

        let nextEjecutado = false;

        const next = () => {
            nextEjecutado = true;
        };

        middleware(req, {}, next);

        assert.equal(
            nextEjecutado,
            true
        );
    }
);


// =========================================================
// USUARIO SIN PERMISO
// =========================================================

test(
    'Rechaza al usuario cuando no posee el permiso',
    () => {

        const middleware =
            requierePermiso('MESAS_GESTIONAR');

        const req = {
            usuario: {
                permisos: [
                    'RESULTADOS_CONSULTAR'
                ]
            }
        };

        let errorRecibido = null;

        const next = (error) => {
            errorRecibido = error;
        };

        middleware(req, {}, next);

        assert.ok(errorRecibido);

        assert.equal(
            errorRecibido.status,
            403
        );
    }
);


// =========================================================
// USUARIO NO AUTENTICADO
// =========================================================

test(
    'Rechaza la solicitud cuando no existe usuario autenticado',
    () => {

        const middleware =
            requierePermiso('VOTACIONES_GESTIONAR');

        const req = {};

        let errorRecibido = null;

        const next = (error) => {
            errorRecibido = error;
        };

        middleware(req, {}, next);

        assert.ok(errorRecibido);

        assert.equal(
            errorRecibido.status,
            401
        );
    }
);