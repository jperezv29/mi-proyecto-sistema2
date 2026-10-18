function errorHandler(error, req, res, next) {

    console.error(error);

    const status = error.status || 500;

    const type = error.type
        ? `https://votagt.local/problems/${error.type}`
        : 'https://votagt.local/problems/internal-server-error';

   const titleMap = {
    400: 'Solicitud inválida',
    401: 'No autorizado',
    403: 'Acceso prohibido',
    404: 'Recurso no encontrado',
    409: 'Conflicto',
    500: 'Error interno del servidor'
};

    res.status(status)
        .type('application/problem+json')
        .json({
            type: type,
            title: titleMap[status] || 'Error',
            status: status,
            detail:
                status === 500
                    ? 'Ocurrió un error interno en el servidor.'
                    : error.message,
            instance: req.originalUrl
        });
}

module.exports = errorHandler;