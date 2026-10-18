const resultadoService =
    require('../services/resultado.service');

async function registrar(req, res, next) {
    try {
        const usuarioId = req.usuario.sub;

        const resultado =
    await resultadoService.registrarResultado(
        req.params.votacionId,
        req.body,
        usuarioId,
        req.usuario.username
    );

        res.status(201).json({
            mensaje: 'Resultado registrado correctamente.',
            datos: resultado
        });

    } catch (error) {
        next(error);
    }
}


async function consultarDetalle(req, res, next) {
    try {
        const resultado =
            await resultadoService.obtenerDetalleResultado(
                req.params.votacionId,
                {
                    mesaId: req.query.mesaId,
                    candidatoId: req.query.candidatoId
                }
            );

        res.status(200).json({
            datos: resultado
        });

    } catch (error) {
        next(error);
    }
}

async function actualizar(req, res, next) {
    try {
        const resultado =
            await resultadoService.actualizarResultado(
                req.params.votacionId,
                req.body,
                req.usuario.sub,
                req.usuario.username
            );

        res.status(200).json({
            mensaje: 'Resultado actualizado correctamente.',
            datos: resultado
        });

    } catch (error) {
        next(error);
    }
}

async function consultar(req, res, next) {
    try {
        const resultados =
            await resultadoService.obtenerResultados(
                req.params.votacionId
            );

        res.status(200).json({
            datos: resultados
        });

    } catch (error) {
        next(error);
    }
}

// =========================================================
// EXPORTAR RESULTADOS
// =========================================================

async function exportarResultados(
    req,
    res,
    next
) {

    try {

        const {
            votacionId
        } = req.params;

        const formato =
            req.query.formato || 'json';


        const reporte =
            await resultadoService
                .exportarResultados(
                    votacionId,
                    formato
                );


        res.setHeader(
            'Content-Type',
            reporte.contentType
        );


        res.setHeader(
            'Content-Disposition',
            `attachment; filename="resultados-votacion-${votacionId}.${reporte.extension}"`
        );


        return res
            .status(200)
            .send(
                reporte.contenido
            );

    } catch (error) {

        next(error);
    }
}

module.exports = {
    registrar,
    consultarDetalle,
    actualizar,
    consultar,
    exportarResultados
};