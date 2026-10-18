const bcrypt = require('bcrypt');

const usuarioRepository =
    require('../repositories/usuario.repository');

const authRepository =
    require('../repositories/auth.repository');

const eventBus =
    require('../events/eventBus');

const {
    sincronizarAutorizacion
} = require('../graph/authorization.graph');

function validarId(id) {
    const valor = Number(id);

    if (!Number.isInteger(valor) || valor <= 0) {
        const error = new Error(
            'El identificador del usuario no es válido.'
        );
        error.status = 400;
        error.type = 'invalid-user-id';
        throw error;
    }

    return valor;
}

function limpiarTexto(valor) {
    return String(valor ?? '').trim();
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sincronizarUsuario(usuarioId) {
    const usuario =
        await usuarioRepository.obtenerUsuarioPorId(usuarioId);

    if (!usuario) return;

    const roles =
        await authRepository.obtenerRoles(usuario.id);

    const permisos =
        await authRepository.obtenerPermisos(usuario.id);

    try {
        await sincronizarAutorizacion({
            usuarioId: usuario.id,
            username: usuario.username,
            roles,
            permisos
        });
    } catch (error) {
        // PostgreSQL sigue siendo la fuente de verdad.
        // Si Neo4j falla temporalmente, el próximo login
        // volverá a sincronizar roles y permisos.
        console.warn(
            `No fue posible sincronizar Neo4j para ${usuario.username}:`,
            error.message
        );
    }
}

async function listarUsuarios() {
    return await usuarioRepository.listarUsuarios();
}

async function listarRoles() {
    return await usuarioRepository.listarRoles();
}

async function obtenerUsuarioPorId(id) {
    const usuarioId = validarId(id);

    const usuario =
        await usuarioRepository.obtenerUsuarioPorId(usuarioId);

    if (!usuario) {
        const error = new Error('El usuario solicitado no existe.');
        error.status = 404;
        error.type = 'user-not-found';
        throw error;
    }

    return usuario;
}

async function crearUsuario(datos, actor) {
    const username = limpiarTexto(datos.username);
    const email = limpiarTexto(datos.email).toLowerCase();
    const nombres = limpiarTexto(datos.nombres);
    const apellidos = limpiarTexto(datos.apellidos);
    const password = String(datos.password ?? '');
    const rol = limpiarTexto(datos.rol).toUpperCase();

    if (
        !username ||
        !email ||
        !nombres ||
        !apellidos ||
        !password ||
        !rol
    ) {
        const error = new Error(
            'Usuario, correo, nombres, apellidos, contraseña y rol son obligatorios.'
        );
        error.status = 400;
        error.type = 'validation-error';
        throw error;
    }

    if (username.length < 3) {
        const error = new Error(
            'El nombre de usuario debe tener al menos 3 caracteres.'
        );
        error.status = 400;
        error.type = 'invalid-username';
        throw error;
    }

    if (!validarEmail(email)) {
        const error = new Error('El correo electrónico no es válido.');
        error.status = 400;
        error.type = 'invalid-email';
        throw error;
    }

    if (password.length < 8) {
        const error = new Error(
            'La contraseña inicial debe tener al menos 8 caracteres.'
        );
        error.status = 400;
        error.type = 'weak-password';
        throw error;
    }

    const duplicado =
        await usuarioRepository.buscarDuplicado(username, email);

    if (duplicado) {
        const error = new Error(
            'Ya existe un usuario con ese nombre de usuario o correo electrónico.'
        );
        error.status = 409;
        error.type = 'user-already-exists';
        throw error;
    }

    const passwordHash =
        await bcrypt.hash(password, 12);

    let usuario;

    try {
        usuario = await usuarioRepository.crearUsuario({
            username,
            email,
            nombres,
            apellidos,
            passwordHash,
            rol
        });
    } catch (error) {
        if (error.code === '23505') {
            const conflicto = new Error(
                'Ya existe un usuario con ese nombre de usuario o correo electrónico.'
            );
            conflicto.status = 409;
            conflicto.type = 'user-already-exists';
            throw conflicto;
        }

        throw error;
    }

    await sincronizarUsuario(usuario.id);

    eventBus.emit('AUDITORIA', {
        tipo: 'USUARIO_CREADO',
        usuarioId: actor.id,
        username: actor.username,
        recurso: 'USUARIO',
        recursoId: usuario.id,
        detalle:
            `Se creó el usuario ${usuario.username} con rol ${rol}`
    });

    return await usuarioRepository.obtenerUsuarioPorId(usuario.id);
}

async function actualizarUsuario(id, datos, actor) {
    const usuarioId = validarId(id);

    const actual =
        await usuarioRepository.obtenerUsuarioPorId(usuarioId);

    if (!actual) {
        const error = new Error('El usuario solicitado no existe.');
        error.status = 404;
        error.type = 'user-not-found';
        throw error;
    }

    const username = limpiarTexto(
        datos.username !== undefined
            ? datos.username
            : actual.username
    );

    const email = limpiarTexto(
        datos.email !== undefined
            ? datos.email
            : actual.email
    ).toLowerCase();

    const nombres = limpiarTexto(
        datos.nombres !== undefined
            ? datos.nombres
            : actual.nombres
    );

    const apellidos = limpiarTexto(
        datos.apellidos !== undefined
            ? datos.apellidos
            : actual.apellidos
    );

    if (!username || !email || !nombres || !apellidos) {
        const error = new Error(
            'Usuario, correo, nombres y apellidos son obligatorios.'
        );
        error.status = 400;
        error.type = 'validation-error';
        throw error;
    }

    if (!validarEmail(email)) {
        const error = new Error('El correo electrónico no es válido.');
        error.status = 400;
        error.type = 'invalid-email';
        throw error;
    }

    const duplicado =
        await usuarioRepository.buscarDuplicado(
            username,
            email,
            usuarioId
        );

    if (duplicado) {
        const error = new Error(
            'Otro usuario ya utiliza ese nombre de usuario o correo electrónico.'
        );
        error.status = 409;
        error.type = 'user-already-exists';
        throw error;
    }

    let actualizado;

    try {
        actualizado =
            await usuarioRepository.actualizarUsuario(
                usuarioId,
                {
                    username,
                    email,
                    nombres,
                    apellidos
                }
            );
    } catch (error) {
        if (error.code === '23505') {
            const conflicto = new Error(
                'Otro usuario ya utiliza ese nombre de usuario o correo electrónico.'
            );
            conflicto.status = 409;
            conflicto.type = 'user-already-exists';
            throw conflicto;
        }

        throw error;
    }

    await sincronizarUsuario(usuarioId);

    eventBus.emit('AUDITORIA', {
        tipo: 'USUARIO_ACTUALIZADO',
        usuarioId: actor.id,
        username: actor.username,
        recurso: 'USUARIO',
        recursoId: usuarioId,
        detalle:
            `Se actualizaron los datos del usuario ${actualizado.username}`
    });

    return await usuarioRepository.obtenerUsuarioPorId(usuarioId);
}

async function cambiarRol(id, rol, actor) {
    const usuarioId = validarId(id);
    const nombreRol = limpiarTexto(rol).toUpperCase();

    if (!nombreRol) {
        const error = new Error('Debes seleccionar un rol.');
        error.status = 400;
        error.type = 'validation-error';
        throw error;
    }

    if (Number(actor.id) === usuarioId) {
        const error = new Error(
            'No puedes cambiar tu propio rol mientras tienes la sesión iniciada.'
        );
        error.status = 409;
        error.type = 'self-role-change-not-allowed';
        throw error;
    }

    const usuario =
        await usuarioRepository.obtenerUsuarioPorId(usuarioId);

    if (!usuario) {
        const error = new Error('El usuario solicitado no existe.');
        error.status = 404;
        error.type = 'user-not-found';
        throw error;
    }

    const rolAsignado =
        await usuarioRepository.cambiarRol(usuarioId, nombreRol);

    await sincronizarUsuario(usuarioId);

    eventBus.emit('AUDITORIA', {
        tipo: 'ROL_USUARIO_CAMBIADO',
        usuarioId: actor.id,
        username: actor.username,
        recurso: 'USUARIO',
        recursoId: usuarioId,
        detalle:
            `Se asignó el rol ${rolAsignado.nombre} al usuario ${usuario.username}`
    });

    return await usuarioRepository.obtenerUsuarioPorId(usuarioId);
}

async function cambiarEstado(id, estado, actor) {
    const usuarioId = validarId(id);
    const nuevoEstado = limpiarTexto(estado).toUpperCase();

    const estadosPermitidos = [
        'ACTIVO',
        'INACTIVO',
        'BLOQUEADO'
    ];

    if (!estadosPermitidos.includes(nuevoEstado)) {
        const error = new Error(
            'El estado debe ser ACTIVO, INACTIVO o BLOQUEADO.'
        );
        error.status = 400;
        error.type = 'invalid-user-status';
        throw error;
    }

    if (Number(actor.id) === usuarioId) {
        const error = new Error(
            'No puedes modificar el estado de tu propia cuenta mientras tienes la sesión iniciada.'
        );
        error.status = 409;
        error.type = 'self-status-change-not-allowed';
        throw error;
    }

    const usuario =
        await usuarioRepository.obtenerUsuarioPorId(usuarioId);

    if (!usuario) {
        const error = new Error('El usuario solicitado no existe.');
        error.status = 404;
        error.type = 'user-not-found';
        throw error;
    }

    const actualizado =
        await usuarioRepository.cambiarEstado(
            usuarioId,
            nuevoEstado
        );

    eventBus.emit('AUDITORIA', {
        tipo: 'ESTADO_USUARIO_CAMBIADO',
        usuarioId: actor.id,
        username: actor.username,
        recurso: 'USUARIO',
        recursoId: usuarioId,
        detalle:
            `El usuario ${usuario.username} cambió de ${usuario.estado} a ${nuevoEstado}`
    });

    return {
        ...actualizado,
        roles: usuario.roles || []
    };
}

module.exports = {
    listarUsuarios,
    listarRoles,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    cambiarRol,
    cambiarEstado
};
