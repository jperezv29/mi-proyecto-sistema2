// =========================================================
// STRATEGY - RESULTADOS
// =========================================================


// =========================================================
// ESTRATEGIA JSON
// =========================================================

class JsonResultadosStrategy {

    generar(datos) {

        return {
            contenido: JSON.stringify(
                datos,
                null,
                2
            ),

            contentType:
                'application/json; charset=utf-8',

            extension:
                'json'
        };
    }
}


// =========================================================
// ESTRATEGIA CSV
// =========================================================

class CsvResultadosStrategy {

    generar(datos) {

        const candidatos =
            datos.candidatos || [];


        // Si no existen resultados

        if (candidatos.length === 0) {

            return {
                contenido:
                    'Sin resultados disponibles',

                contentType:
                    'text/csv; charset=utf-8',

                extension:
                    'csv'
            };
        }


        // Obtener columnas automáticamente

        const columnas =
            Object.keys(
                candidatos[0]
            );


        // Encabezados CSV

        const encabezado =
            columnas.join(',');


        // Filas CSV

        const filas =
            candidatos.map(
                candidato => {

                    return columnas.map(
                        columna => {

                            const valor =
                                candidato[columna];

                            return this
                                .escaparValor(
                                    valor
                                );
                        }
                    ).join(',');
                }
            );


        // Información general

        const resumen = [
            `Votacion ID,${datos.votacionId}`,
            `Mesas con resultados,${datos.mesasConResultados}`,
            `Total votos registrados,${datos.totalVotosRegistrados}`,
            ''
        ];


        const contenido = [
            ...resumen,
            encabezado,
            ...filas
        ].join('\n');


        return {
            contenido,

            contentType:
                'text/csv; charset=utf-8',

            extension:
                'csv'
        };
    }


    escaparValor(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {
            return '';
        }


        const texto =
            String(valor);


        // Escapar comillas

        const escapado =
            texto.replace(
                /"/g,
                '""'
            );


        // Si contiene caracteres especiales,
        // encerrarlo entre comillas

        if (
            escapado.includes(',') ||
            escapado.includes('"') ||
            escapado.includes('\n')
        ) {

            return `"${escapado}"`;
        }


        return escapado;
    }
}


// =========================================================
// SELECCIONAR ESTRATEGIA
// =========================================================

function obtenerEstrategia(
    formato
) {

    const formatoNormalizado =
        String(
            formato || 'json'
        ).toLowerCase();


    switch (
        formatoNormalizado
    ) {

        case 'json':

            return new JsonResultadosStrategy();


        case 'csv':

            return new CsvResultadosStrategy();


        default: {

            const error =
                new Error(
                    'El formato solicitado no es válido. Use json o csv.'
                );

            error.status = 400;

            error.type =
                'invalid-report-format';

            throw error;
        }
    }
}


module.exports = {
    JsonResultadosStrategy,
    CsvResultadosStrategy,
    obtenerEstrategia
};