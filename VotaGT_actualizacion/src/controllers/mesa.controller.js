const mesaService =
    require('../services/mesa.service');

async function listar(req, res, next) {
    try {
        const mesas =
            await mesaService.listarMesas(
                req.params.votacionId
            );

        res.status(200).json({
            total: mesas.length,
            datos: mesas
        });

    } catch (error) {
        next(error);
    }
}

async function crear(req, res, next) {
    try {
       const mesa =
    await mesaService.crearMesa(
        req.params.votacionId,
        req.body,
        req.usuario.sub,
        req.usuario.username
    );

        res.status(201).json({
            mensaje: 'Mesa registrada correctamente.',
            datos: mesa
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    listar,
    crear
};