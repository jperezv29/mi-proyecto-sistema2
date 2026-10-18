function requierePermiso(permisoRequerido) {

    return function (req, res, next) {

        if (!req.usuario) {
            const error = new Error(
                'No existe información del usuario autenticado.'
            );

            error.status = 401;
            error.type = 'authentication-required';

            return next(error);
        }

        const permisos = req.usuario.permisos || [];

        if (!permisos.includes(permisoRequerido)) {

            const error = new Error(
                `No posee el permiso requerido: ${permisoRequerido}.`
            );

            error.status = 403;
            error.type = 'insufficient-permissions';

            return next(error);
        }

        next();
    };
}

module.exports = {
    requierePermiso
};