const express = require('express');

const authController =
    require('../controllers/auth.controller');

const {
    verificarToken
} = require('../middlewares/auth.middleware');

const router = express.Router();

router.post(
    '/login',
    authController.login
);

router.get(
    '/perfil',
    verificarToken,
    authController.perfil
);

module.exports = router;