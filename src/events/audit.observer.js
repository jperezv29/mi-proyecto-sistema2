const eventBus =
    require('./eventBus');

const {
    registrarEvento
} = require('../audit/audit.service');


eventBus.on(
    'AUDITORIA',
    async (evento) => {

        try {

            await registrarEvento(
                evento
            );

        } catch (error) {

            console.error(
                'Error en Audit Observer:',
                error.message
            );
        }
    }
);


console.log(
    'Audit Observer registrado'
);