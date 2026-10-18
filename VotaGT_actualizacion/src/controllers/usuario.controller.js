const usuarioService =
    require('../services/usuario.service');

function actorDesdeRequest(req) {
    return {
        id: req.usuario.sub,
        username: req.usuario.username
    };
}

async function listar(req, res, next) {
    try {
        const usuarios =
            await usuarioService.listarUsuarios();

        res.status(200).json({
            total: usuarios.length,
            datos: usuarios
        });
    } catch (error) {
        next(error);
    }
}

async function listarRoles(req, res, next) {
    try {
        const roles =
            await usuarioService.listarRoles();

        res.status(200).json({
            total: roles.length,
            datos: roles
        });
    } catch (error) {
        next(error);
    }
}

async function obtenerPorId(req, res, next) {
    try {
        const usuario =
            await usuarioService.obtenerUsuarioPorId(
                req.params.id
            );

        res.status(200).json({
            datos: usuario
        });
    } catch (error) {
        next(error);
    }
}

async function crear(req, res, next) {
    try {
        const usuario =
            await usuarioService.crearUsuario(
                req.body,
                actorDesdeRequest(req)
            );

        res.status(201).json({
            mensaje: 'Usuario creado correctamente.',
            datos: usuario
        });
    } catch (error) {
        next(error);
    }
}

async function actualizar(req, res, next) {
    try {
        const usuario =
            await usuarioService.actualizarUsuario(
                req.params.id,
                req.body,
                actorDesdeRequest(req)
            );

        res.status(200).json({
            mensaje: 'Usuario actualizado correctamente.',
            datos: usuario
        });
    } catch (error) {
        next(error);
    }
}

async function cambiarRol(req, res, next) {
    try {
        const usuario =
            await usuarioService.cambiarRol(
                req.params.id,
                req.body.rol,
                actorDesdeRequest(req)
            );

        res.status(200).json({
            mensaje: 'Rol actualizado correctamente.',
            datos: usuario
        });
    } catch (error) {
        next(error);
    }
}

async function cambiarEstado(req, res, next) {
    try {
        const usuario =
            await usuarioService.cambiarEstado(
                req.params.id,
                req.body.estado,
                actorDesdeRequest(req)
            );

        res.status(200).json({
            mensaje: 'Estado actualizado correctamente.',
            datos: usuario
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listar,
    listarRoles,
    obtenerPorId,
    crear,
    actualizar,
    cambiarRol,
    cambiarEstado
};
