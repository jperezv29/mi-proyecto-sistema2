const authService = require('../services/auth.service');

async function login(req, res, next) {
    try {
        const {
            identificador,
            password
        } = req.body;

        const resultado = await authService.login(
            identificador,
            password
        );

        res.status(200).json(resultado);

    } catch (error) {
        next(error);
    }
}

async function perfil(req, res) {
    res.status(200).json({
        mensaje: 'Token válido',
        usuario: req.usuario
    });
}

module.exports = {
    login,
    perfil
};