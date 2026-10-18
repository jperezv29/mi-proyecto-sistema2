const candidatoService =
    require('../services/candidato.service');

async function listar(req, res, next) {

    try {

        const candidatos =
            await candidatoService.listarCandidatos(
                req.params.votacionId
            );

        res.status(200).json({
            total: candidatos.length,
            datos: candidatos
        });

    } catch (error) {
        next(error);
    }
}

async function crear(req, res, next) {

    try {

        const candidato =
    await candidatoService.crearCandidato(
        req.params.votacionId,
        req.body,
        req.usuario.sub,
        req.usuario.username
    );

        res.status(201).json({
            mensaje: 'Candidato registrado correctamente.',
            datos: candidato
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    listar,
    crear
};