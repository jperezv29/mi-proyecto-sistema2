const express = require('express');

const mesaController =
    require('../controllers/mesa.controller');

const {
    verificarToken
} = require('../middlewares/auth.middleware');

const {
    requierePermiso
} = require('../middlewares/permission.middleware');

const router = express.Router({
    mergeParams: true
});

router.get(
    '/',
    verificarToken,
    mesaController.listar
);

router.post(
    '/',
    verificarToken,
    requierePermiso('MESAS_GESTIONAR'),
    mesaController.crear
);

module.exports = router;