class CircuitBreaker {

    constructor({
        nombre = 'servicio',
        limiteFallos = 3,
        tiempoReintento = 30000
    } = {}) {

        this.nombre = nombre;

        this.limiteFallos =
            limiteFallos;

        this.tiempoReintento =
            tiempoReintento;

        this.fallos = 0;

        this.estado = 'CLOSED';

        this.proximoIntento = 0;
    }


    async ejecutar(
        operacion,
        fallback = null
    ) {

        // ==========================================
        // CIRCUITO ABIERTO
        // ==========================================

        if (this.estado === 'OPEN') {

            if (
                Date.now() <
                this.proximoIntento
            ) {

                console.warn(
                    `CIRCUIT OPEN → ${this.nombre}`
                );

                if (fallback) {
                    return await fallback();
                }

                throw new Error(
                    `Circuito abierto para ${this.nombre}`
                );
            }


            // Tiempo cumplido:
            // intentar nuevamente

            this.estado =
                'HALF_OPEN';

            console.log(
                `CIRCUIT HALF_OPEN → ${this.nombre}`
            );
        }


        try {

            const resultado =
                await operacion();


            // ======================================
            // OPERACION EXITOSA
            // ======================================

            this.fallos = 0;

            if (
                this.estado ===
                'HALF_OPEN'
            ) {

                console.log(
                    `CIRCUIT CLOSED → ${this.nombre}`
                );
            }

            this.estado = 'CLOSED';

            return resultado;

        } catch (error) {

            // ======================================
            // OPERACION FALLIDA
            // ======================================

            this.fallos++;

            console.warn(
                `FALLO ${this.fallos}/${this.limiteFallos} → ${this.nombre}`
            );


            if (
                this.fallos >=
                this.limiteFallos
            ) {

                this.estado = 'OPEN';

                this.proximoIntento =
                    Date.now() +
                    this.tiempoReintento;

                console.warn(
                    `CIRCUIT OPEN → ${this.nombre}`
                );
            }


            if (fallback) {

                return await fallback(
                    error
                );
            }


            throw error;
        }
    }


    obtenerEstado() {

        return {
            nombre: this.nombre,
            estado: this.estado,
            fallos: this.fallos
        };
    }
}


module.exports =
    CircuitBreaker;