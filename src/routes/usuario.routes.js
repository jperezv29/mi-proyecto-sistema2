const express = require('express');

const usuarioController =
    require('../controllers/usuario.controller');

const {
    verificarToken
} = require('../middlewares/auth.middleware');

const {
    requierePermiso
} = require('../middlewares/permission.middleware');

const router = express.Router();

router.use(
    verificarToken,
    requierePermiso('USUARIOS_GESTIONAR')
);

// Debe ir antes de /:id para que "roles" no se interprete como ID.
router.get(
    '/roles',
    usuarioController.listarRoles
);

router.get(
    '/',
    usuarioController.listar
);

router.get(
    '/:id',
    usuarioController.obtenerPorId
);

router.post(
    '/',
    usuarioController.crear
);

router.patch(
    '/:id',
    usuarioController.actualizar
);

router.patch(
    '/:id/rol',
    usuarioController.cambiarRol
);

router.patch(
    '/:id/estado',
    usuarioController.cambiarEstado
);

module.exports = router;
