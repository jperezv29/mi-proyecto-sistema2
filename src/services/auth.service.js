const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const eventBus =
    require('../events/eventBus');
const {
    sincronizarAutorizacion
} = require('../graph/authorization.graph');
const authRepository = require('../repositories/auth.repository');

async function login(identificador, password) {

    if (!identificador || !password) {
        const error = new Error(
            'El usuario y la contraseña son obligatorios.'
        );
        error.status = 400;
        error.type = 'validation-error';
        throw error;
    }

    const usuario = await authRepository.buscarUsuario(identificador);

    if (!usuario) {
        const error = new Error(
            'El usuario o la contraseña proporcionados no son válidos.'
        );
        error.status = 401;
        error.type = 'invalid-credentials';
        throw error;
    }

    if (usuario.estado === 'INACTIVO') {
        const error = new Error(
            'La cuenta se encuentra inactiva.'
        );
        error.status = 403;
        error.type = 'inactive-account';
        throw error;
    }

    if (usuario.estado === 'BLOQUEADO') {

        if (
            usuario.bloqueado_hasta &&
            new Date(usuario.bloqueado_hasta) <= new Date()
        ) {
            await authRepository.desbloquearUsuario(usuario.id);

            usuario.estado = 'ACTIVO';
            usuario.intentos_fallidos = 0;
            usuario.bloqueado_hasta = null;

        } else {
            const error = new Error(
                'La cuenta se encuentra bloqueada temporalmente.'
            );
            error.status = 403;
            error.type = 'blocked-account';
            throw error;
        }
    }

    const passwordCorrecta = await bcrypt.compare(
        password,
        usuario.password_hash
    );

    if (!passwordCorrecta) {

        const intentos =
            await authRepository.registrarIntentoFallido(usuario.id);

        if (intentos >= 5) {

            await authRepository.bloquearUsuario(usuario.id);

            const error = new Error(
                'La cuenta fue bloqueada durante 15 minutos por múltiples intentos fallidos.'
            );
            error.status = 403;
            error.type = 'account-temporarily-locked';
            throw error;
        }

        const error = new Error(
            'El usuario o la contraseña proporcionados no son válidos.'
        );

        error.status = 401;
        error.type = 'invalid-credentials';
        throw error;
    }

    const roles =
        await authRepository.obtenerRoles(usuario.id);

    const permisos =
        await authRepository.obtenerPermisos(usuario.id);
	await sincronizarAutorizacion({
    usuarioId: usuario.id,
    username: usuario.username,
    roles,
    permisos
});

    const token = jwt.sign(
        {
            sub: usuario.id,
            username: usuario.username,
            roles,
            permisos
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        }
    );

    await authRepository.registrarLoginExitoso(usuario.id);

    eventBus.emit(
    'AUDITORIA',
    {
        tipo: 'LOGIN_EXITOSO',
        usuarioId: usuario.id,
        username: usuario.username,
        recurso: 'AUTH',
        recursoId: usuario.id,
        detalle: 'Inicio de sesión exitoso'
    }
);
    return {
        token,
        tokenType: 'Bearer',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',

        usuario: {
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            roles,
            permisos
        }
    };
}

module.exports = {
    login
};