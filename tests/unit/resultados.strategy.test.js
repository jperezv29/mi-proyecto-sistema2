const test = require('node:test');
const assert = require('node:assert/strict');

const {
    JsonResultadosStrategy,
    CsvResultadosStrategy,
    obtenerEstrategia
} = require('../../src/strategies/resultados.strategy');


const datos = {
    votacionId: 7,
    mesasConResultados: 2,
    totalVotosRegistrados: 150,
    candidatos: [
        {
            candidato_id: 1,
            nombre: 'Candidato A',
            partido: 'Partido A',
            total_votos: 80
        },
        {
            candidato_id: 2,
            nombre: 'Candidato B',
            partido: 'Partido B',
            total_votos: 70
        }
    ]
};


test(
    'Strategy JSON genera un reporte válido',
    () => {

        const estrategia =
            new JsonResultadosStrategy();

        const resultado =
            estrategia.generar(datos);

        assert.equal(
            resultado.extension,
            'json'
        );

        assert.match(
            resultado.contentType,
            /application\/json/
        );

        const contenido =
            JSON.parse(resultado.contenido);

        assert.equal(
            contenido.votacionId,
            7
        );

        assert.equal(
            contenido.candidatos.length,
            2
        );
    }
);


test(
    'Strategy CSV genera un reporte válido',
    () => {

        const estrategia =
            new CsvResultadosStrategy();

        const resultado =
            estrategia.generar(datos);

        assert.equal(
            resultado.extension,
            'csv'
        );

        assert.match(
            resultado.contentType,
            /text\/csv/
        );

        assert.match(
            resultado.contenido,
            /Votacion ID,7/
        );

        assert.match(
            resultado.contenido,
            /Candidato A/
        );
    }
);


test(
    'Strategy rechaza formatos no soportados',
    () => {

        assert.throws(
            () => obtenerEstrategia('pdf'),
            error => {

                assert.equal(
                    error.status,
                    400
                );

                assert.equal(
                    error.type,
                    'invalid-report-format'
                );

                return true;
            }
        );
    }
);