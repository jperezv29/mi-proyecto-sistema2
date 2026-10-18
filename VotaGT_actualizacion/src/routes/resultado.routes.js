const express = require('express');

const resultadoController =
    require('../controllers/resultado.controller');

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
    '/detalle',
    verificarToken,
    requierePermiso('RESULTADOS_CONSULTAR'),
    resultadoController.consultarDetalle
);

router.patch(
    '/',
    verificarToken,
    requierePermiso('RESULTADOS_REGISTRAR'),
    resultadoController.actualizar
);

router.get(
    '/',
    verificarToken,
    requierePermiso('RESULTADOS_CONSULTAR'),
    resultadoController.consultar
);

router.post(
    '/',
    verificarToken,
    requierePermiso('RESULTADOS_REGISTRAR'),
    resultadoController.registrar
);

router.get(
    '/exportar',
    verificarToken,
    requierePermiso(
        'REPORTES_GENERAR'
    ),
    resultadoController.exportarResultados
);

module.exports = router;