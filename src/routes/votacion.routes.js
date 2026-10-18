const express = require('express');

const votacionController =
    require('../controllers/votacion.controller');

const {
    verificarToken
} = require('../middlewares/auth.middleware');

const {
    requierePermiso
} = require('../middlewares/permission.middleware');

const router = express.Router();

router.get(
    '/',
    verificarToken,
    votacionController.listar
);

router.get(
    '/:id',
    verificarToken,
    votacionController.obtenerPorId
);

router.post(
    '/',
    verificarToken,
    requierePermiso('VOTACIONES_GESTIONAR'),
    votacionController.crear
);

router.delete(
    '/:id',
    verificarToken,
    requierePermiso('VOTACIONES_GESTIONAR'),
    votacionController.eliminar
);


router.delete(
    '/:id',
    verificarToken,
    requierePermiso('VOTACIONES_GESTIONAR'),
    votacionController.eliminar
);

module.exports = router;