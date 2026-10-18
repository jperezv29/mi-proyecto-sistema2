# language: es

Característica: Integración mediante API REST
  Como consumidor externo autorizado
  Quiero utilizar la API REST de VotaGT
  Para consultar información electoral de forma segura

  # HU-19 - Autenticarse mediante API
  Escenario: Autenticación correcta mediante API
    Dado que existe una aplicación externa autorizada
    Y proporciona credenciales válidas
    Cuando realiza una solicitud de autenticación a la API
    Entonces la API debe responder con código 200
    Y debe retornar un token de acceso válido

  Escenario: Autenticación mediante API con credenciales incorrectas
    Dado que una aplicación externa proporciona credenciales incorrectas
    Cuando realiza una solicitud de autenticación a la API
    Entonces la API debe responder con código 401
    Y debe indicar que las credenciales no son válidas

  # HU-20 - Consultar votaciones mediante API
  Escenario: Consultar votaciones mediante API
    Dado que la aplicación externa posee un token válido
    Y existen votaciones registradas
    Cuando realiza una solicitud GET al recurso de votaciones
    Entonces la API debe responder con código 200
    Y debe retornar la lista de votaciones en formato JSON

  Escenario: Consultar votaciones con token inválido
    Dado que la aplicación externa posee un token inválido o vencido
    Cuando realiza una solicitud GET al recurso de votaciones
    Entonces la API debe responder con código 401
    Y debe indicar que la autenticación es requerida

  # HU-21 - Consultar candidatos mediante API
  Escenario: Consultar candidatos de una votación mediante API
    Dado que la aplicación externa posee un token válido
    Y existen candidatos asociados a una votación
    Cuando solicita los candidatos de esa votación
    Entonces la API debe responder con código 200
    Y debe retornar los candidatos en formato JSON

  Escenario: Consultar candidatos de una votación inexistente mediante API
    Dado que la aplicación externa posee un token válido
    Cuando solicita candidatos de una votación que no existe
    Entonces la API debe responder con código 404
    Y debe indicar que la votación no fue encontrada

  # HU-22 - Consultar resultados mediante API
  Escenario: Consultar resultados electorales mediante API
    Dado que un medio de comunicación o aplicación externa posee un token válido
    Y existen resultados registrados
    Cuando realiza una solicitud GET al recurso de resultados
    Entonces la API debe responder con código 200
    Y debe retornar los resultados en formato JSON

  Escenario: Consultar resultados inexistentes mediante API
    Dado que la aplicación externa posee un token válido
    Cuando solicita resultados de una votación sin datos registrados
    Entonces la API debe responder con código 200
    Y debe retornar una colección vacía o un mensaje indicando que no existen resultados

  Escenario: Consultar resultados sin autenticación
    Dado que una aplicación externa no proporciona un token de acceso
    Cuando intenta consultar los resultados protegidos
    Entonces la API debe responder con código 401
    Y debe indicar que la autenticación es requerida
