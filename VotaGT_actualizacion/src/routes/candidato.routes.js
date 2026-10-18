const express = require('express');

const candidatoController =
    require('../controllers/candidato.controller');

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
    candidatoController.listar
);

router.post(
    '/',
    verificarToken,
    requierePermiso('CANDIDATOS_GESTIONAR'),
    candidatoController.crear
);

module.exports = router;