const votacionService =
    require('../services/votacion.service');

async function listar(req, res, next) {

    try {

        const votaciones =
            await votacionService.listarVotaciones();

        res.status(200).json({
            total: votaciones.length,
            datos: votaciones
        });

    } catch (error) {
        next(error);
    }
}

async function crear(req, res, next) {

    try {

        const usuarioId = req.usuario.sub;
	const username = req.usuario.username;

       const votacion =
    await votacionService.crearVotacion(
        req.body,
        usuarioId,
        username
    );

        res.status(201).json({
            mensaje: 'Votación creada correctamente.',
            datos: votacion
        });

    } catch (error) {
        next(error);
    }
}

async function obtenerPorId(req, res, next) {

    try {

        const votacion =
            await votacionService.obtenerVotacionPorId(
                req.params.id
            );

        res.status(200).json({
            datos: votacion
        });

    } catch (error) {
        next(error);
    }
}

// =========================================================
// ELIMINAR VOTACION
// =========================================================

async function eliminar(req, res, next) {

    try {

        const usuarioId = req.usuario.sub;
        const username = req.usuario.username;

        const votacion =
            await votacionService.eliminarVotacion(
                req.params.id,
                usuarioId,
                username
            );

        res.status(200).json({
            mensaje:
                'Votación eliminada correctamente.',
            datos: votacion
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    listar,
    crear,
    obtenerPorId,
    eliminar
};