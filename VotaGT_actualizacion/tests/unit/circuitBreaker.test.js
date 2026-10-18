const test = require('node:test');
const assert = require('node:assert/strict');

const CircuitBreaker =
    require('../../src/patterns/circuitBreaker');


test(
    'Circuit Breaker inicia en estado CLOSED',
    () => {

        const breaker =
            new CircuitBreaker({
                nombre: 'Prueba'
            });

        const estado =
            breaker.obtenerEstado();

        assert.equal(
            estado.estado,
            'CLOSED'
        );

        assert.equal(
            estado.fallos,
            0
        );
    }
);


test(
    'Circuit Breaker pasa a OPEN después del límite de fallos',
    async () => {

        const breaker =
            new CircuitBreaker({
                nombre: 'Prueba',
                limiteFallos: 2,
                tiempoReintento: 30000
            });


        const operacionFallida =
            async () => {

                throw new Error(
                    'Servicio no disponible'
                );
            };


        const fallback =
            async () => 'FALLBACK';


        const resultado1 =
            await breaker.ejecutar(
                operacionFallida,
                fallback
            );

        assert.equal(
            resultado1,
            'FALLBACK'
        );


        const resultado2 =
            await breaker.ejecutar(
                operacionFallida,
                fallback
            );

        assert.equal(
            resultado2,
            'FALLBACK'
        );


        const estado =
            breaker.obtenerEstado();

        assert.equal(
            estado.estado,
            'OPEN'
        );

        assert.equal(
            estado.fallos,
            2
        );
    }
);


test(
    'Circuit Breaker pasa de HALF_OPEN a CLOSED al recuperarse',
    async () => {

        const breaker =
            new CircuitBreaker({
                nombre: 'Prueba',
                limiteFallos: 1,
                tiempoReintento: 30000
            });


        await breaker.ejecutar(

            async () => {

                throw new Error(
                    'Fallo simulado'
                );
            },

            async () => 'FALLBACK'
        );


        assert.equal(
            breaker.obtenerEstado().estado,
            'OPEN'
        );


        // Simulamos que ya terminó
        // el tiempo de recuperación.

        breaker.proximoIntento =
            Date.now() - 1;


        const resultado =
            await breaker.ejecutar(
                async () => 'SERVICIO RECUPERADO'
            );


        assert.equal(
            resultado,
            'SERVICIO RECUPERADO'
        );


        assert.equal(
            breaker.obtenerEstado().estado,
            'CLOSED'
        );

        assert.equal(
            breaker.obtenerEstado().fallos,
            0
        );
    }
);