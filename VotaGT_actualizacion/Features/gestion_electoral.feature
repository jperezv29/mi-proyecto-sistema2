# language: es

Característica: Gestión del proceso electoral
  Como usuario autorizado del sistema VotaGT
  Quiero administrar votaciones, candidatos, mesas y resultados
  Para gestionar correctamente un proceso electoral

  Antecedentes:
    Dado que la API VotaGT está disponible
    Y el usuario ha iniciado sesión
    Y posee un token JWT válido


  # =========================================================
  # VOTACIONES
  # =========================================================

  Escenario: Listar votaciones registradas
    Cuando el usuario envía una solicitud GET a "/api/v1/votaciones"
    Entonces el sistema debe responder con estado HTTP 200
    Y debe devolver las votaciones registradas

  Escenario: Crear una votación correctamente
    Dado que el usuario posee el permiso "VOTACIONES_GESTIONAR"
    Cuando envía una solicitud POST a "/api/v1/votaciones"
    Y proporciona nombre, fecha de inicio y fecha de finalización válidas
    Entonces el sistema debe responder con estado HTTP 201
    Y debe almacenar la votación en PostgreSQL
    Y debe registrar el evento "VOTACION_CREADA" en MongoDB

  Escenario: Consultar una votación por identificador
    Dado que existe una votación registrada
    Cuando el usuario consulta "/api/v1/votaciones/{votacionId}"
    Entonces el sistema debe responder con estado HTTP 200
    Y debe devolver la información de la votación

  Escenario: Consultar una votación inexistente
    Cuando el usuario consulta una votación con identificador inexistente
    Entonces el sistema debe responder con estado HTTP 404
    Y debe utilizar el formato "application/problem+json"


  # =========================================================
  # CANDIDATOS
  # =========================================================

  Escenario: Registrar un candidato correctamente
    Dado que existe una votación válida
    Y el usuario posee el permiso "CANDIDATOS_GESTIONAR"
    Cuando envía una solicitud POST a "/api/v1/votaciones/{votacionId}/candidatos"
    Y proporciona los datos válidos del candidato
    Entonces el sistema debe responder con estado HTTP 201
    Y debe almacenar el candidato en PostgreSQL
    Y debe registrar el evento "CANDIDATO_CREADO" en MongoDB

  Escenario: Listar candidatos de una votación
    Dado que existen candidatos registrados en una votación
    Cuando el usuario envía una solicitud GET a "/api/v1/votaciones/{votacionId}/candidatos"
    Entonces el sistema debe responder con estado HTTP 200
    Y debe devolver los candidatos pertenecientes a la votación

  Escenario: Intentar registrar un número de lista duplicado
    Dado que ya existe un candidato con el número de lista indicado
    Cuando el usuario intenta registrar otro candidato con el mismo número de lista
    Entonces el sistema debe responder con estado HTTP 409
    Y debe indicar que existe un conflicto con los datos


  # =========================================================
  # MESAS ELECTORALES
  # =========================================================

  Escenario: Registrar una mesa electoral correctamente
    Dado que existe una votación válida
    Y el usuario posee el permiso "MESAS_GESTIONAR"
    Cuando envía una solicitud POST a "/api/v1/votaciones/{votacionId}/mesas"
    Y proporciona un código y nombre válidos
    Entonces el sistema debe responder con estado HTTP 201
    Y debe almacenar la mesa en PostgreSQL
    Y debe registrar el evento "MESA_CREADA" en MongoDB

  Escenario: Listar mesas electorales
    Dado que existen mesas registradas para una votación
    Cuando el usuario envía una solicitud GET a "/api/v1/votaciones/{votacionId}/mesas"
    Entonces el sistema debe responder con estado HTTP 200
    Y debe devolver las mesas pertenecientes a la votación

  Escenario: Intentar registrar una mesa con código duplicado
    Dado que ya existe una mesa con el código indicado
    Cuando el usuario intenta registrar otra mesa con el mismo código
    Entonces el sistema debe responder con estado HTTP 409
    Y debe indicar que existe un conflicto con los datos


  # =========================================================
  # RESULTADOS
  # =========================================================

  Escenario: Registrar un resultado correctamente
    Dado que existe una votación válida
    Y existe una mesa perteneciente a la votación
    Y existe un candidato perteneciente a la votación
    Y el usuario posee el permiso "RESULTADOS_REGISTRAR"
    Cuando envía una solicitud POST a "/api/v1/votaciones/{votacionId}/resultados"
    Y proporciona una cantidad de votos mayor o igual que cero
    Entonces el sistema debe responder con estado HTTP 201
    Y debe almacenar el resultado en PostgreSQL
    Y debe invalidar la caché de resultados en Redis
    Y debe registrar el evento "RESULTADO_REGISTRADO" en MongoDB

  Escenario: Consultar resultados cuando no existen datos en caché
    Dado que no existe una entrada de resultados para la votación en Redis
    Y el usuario posee el permiso "RESULTADOS_CONSULTAR"
    Cuando envía una solicitud GET a "/api/v1/votaciones/{votacionId}/resultados"
    Entonces el sistema debe responder con estado HTTP 200
    Y debe consultar los resultados en PostgreSQL
    Y debe guardar los resultados en Redis con un tiempo de expiración
    Y la respuesta debe indicar "MISS"

  Escenario: Consultar resultados disponibles en caché
    Dado que los resultados de la votación se encuentran almacenados en Redis
    Y el usuario posee el permiso "RESULTADOS_CONSULTAR"
    Cuando envía una solicitud GET a "/api/v1/votaciones/{votacionId}/resultados"
    Entonces el sistema debe responder con estado HTTP 200
    Y debe obtener los resultados desde Redis
    Y la respuesta debe indicar "HIT"

  Escenario: Intentar registrar un resultado duplicado
    Dado que ya existe un resultado para un candidato en una mesa
    Cuando el usuario intenta registrar nuevamente el resultado
    Entonces el sistema debe responder con estado HTTP 409
    Y debe indicar que el resultado ya existe


  # =========================================================
  # VALIDACIONES
  # =========================================================

  Esquema del escenario: Validar cantidad de votos incorrecta
    Dado que existe una votación válida
    Y existe una mesa válida
    Y existe un candidato válido
    Cuando el usuario intenta registrar "<votos>" votos
    Entonces el sistema debe responder con estado HTTP <estado>

    Ejemplos:
      | votos | estado |
      | -1    | 400    |
      | -10   | 400    |
      | 1.5   | 400    |


  Esquema del escenario: Validar acceso a recursos inexistentes
    Cuando el usuario consulta el recurso "<recurso>"
    Entonces el sistema debe responder con estado HTTP <estado>
    Y debe utilizar el formato "application/problem+json"

    Ejemplos:
      | recurso                                         | estado |
      | /api/v1/votaciones/99999                       | 404    |
      | /api/v1/votaciones/99999/candidatos            | 404    |
      | /api/v1/votaciones/99999/mesas                 | 404    |
      | /api/v1/votaciones/99999/resultados            | 404    |

  Escenario: Exportar resultados en formato CSV
    Dado que existe una votación con resultados registrados
    Y el usuario autenticado posee el permiso "REPORTES_GENERAR"
    Cuando solicita exportar los resultados en formato "csv"
    Entonces el sistema responde con código 200
    Y el tipo de contenido es "text/csv"
    Y se genera un archivo con los resultados de la votación

  Escenario: Exportar resultados en formato JSON
    Dado que existe una votación con resultados registrados
    Y el usuario autenticado posee el permiso "REPORTES_GENERAR"
    Cuando solicita exportar los resultados en formato "json"
    Entonces el sistema responde con código 200
    Y el tipo de contenido es "application/json"
    Y se incluyen los resultados consolidados de la votación

  Esquema del escenario: Rechazar formatos de exportación no soportados
    Dado que existe una votación con resultados registrados
    Y el usuario autenticado posee el permiso "REPORTES_GENERAR"
    Cuando solicita exportar los resultados en formato "<formato>"
    Entonces el sistema responde con código 400
    Y la respuesta utiliza "application/problem+json"
    Y el tipo de error es "invalid-report-format"

    Ejemplos:
      | formato |
      | pdf     |
      | xml     |
      | xlsx    |