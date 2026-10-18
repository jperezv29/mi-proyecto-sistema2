const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            const error = new Error(
                'Se requiere un token de autenticación.'
            );
            error.status = 401;
            error.type = 'missing-token';
            throw error;
        }

        const partes = authorization.split(' ');

        if (
            partes.length !== 2 ||
            partes[0] !== 'Bearer'
        ) {
            const error = new Error(
                'El formato del token de autenticación no es válido.'
            );
            error.status = 401;
            error.type = 'invalid-token-format';
            throw error;
        }

        const token = partes[1];

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = payload;

        next();

    } catch (error) {

        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError'
        ) {
            error.status = 401;
            error.type =
                error.name === 'TokenExpiredError'
                    ? 'expired-token'
                    : 'invalid-token';
        }

        next(error);
    }
}

module.exports = {
    verificarToken
};