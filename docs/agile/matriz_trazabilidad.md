\# Matriz de Trazabilidad Integral - VotaGT



\## Objetivo



La presente matriz relaciona los requerimientos funcionales del sistema

con las historias de usuario, endpoints definidos en OpenAPI, escenarios

BDD, componentes del backend y casos de prueba ejecutados en Postman.



| Requerimiento | Historia de Usuario | Funcionalidad | Endpoint OpenAPI | Escenario BDD | Componente Backend | Caso de Prueba |

|---|---|---|---|---|---|---|

| REQ-FN-001 | HU-01 | Iniciar sesión | POST /api/v1/auth/login | Inicio de sesión exitoso | auth.controller.js / auth.service.js / auth.repository.js | CP-01 Login válido |

| REQ-FN-002 | HU-01 | Consultar perfil autenticado | GET /api/v1/auth/perfil | Consultar perfil con token válido | auth.controller.js / auth.middleware.js | CP-02 Perfil con JWT |

| REQ-FN-003 | HU-05 | Crear votación | POST /api/v1/votaciones | Crear una votación correctamente | votacion.controller.js / votacion.service.js / votacion.repository.js | CP-03 Crear votación |

| REQ-FN-004 | HU-05 | Consultar votaciones | GET /api/v1/votaciones | Listar votaciones registradas | votacion.controller.js / votacion.service.js / votacion.repository.js | CP-04 Listar votaciones |

| REQ-FN-005 | HU-06 | Crear mesa electoral | POST /api/v1/votaciones/{votacionId}/mesas | Registrar una mesa electoral correctamente | mesa.controller.js / mesa.service.js / mesa.repository.js | CP-05 Crear mesa |

| REQ-FN-006 | HU-07 | Registrar candidato | POST /api/v1/votaciones/{votacionId}/candidatos | Registrar un candidato correctamente | candidato.controller.js / candidato.service.js / candidato.repository.js | CP-06 Crear candidato |

| REQ-FN-007 | HU-08 | Registrar resultados | POST /api/v1/votaciones/{votacionId}/resultados | Registrar un resultado correctamente | resultado.controller.js / resultado.service.js / resultado.repository.js | CP-07 Registrar resultado |

| REQ-FN-008 | HU-09 | Consultar resultados | GET /api/v1/votaciones/{votacionId}/resultados | Consultar resultados cuando no existen datos en caché | resultado.controller.js / resultado.service.js / Redis | CP-08 Resultados MISS |

| REQ-FN-009 | HU-09 | Consultar resultados desde caché | GET /api/v1/votaciones/{votacionId}/resultados | Consultar resultados disponibles en caché | resultado.service.js / Redis | CP-09 Resultados HIT |

| REQ-FN-010 | HU-08 | Evitar resultados duplicados | POST /api/v1/votaciones/{votacionId}/resultados | Intentar registrar un resultado duplicado | resultado.service.js | CP-10 Resultado duplicado |

| REQ-FN-011 | HU-01 | Rechazar acceso sin autenticación | GET /api/v1/auth/perfil | Intentar consultar el perfil sin token | auth.middleware.js / errorHandler.js | CP-11 Sin token |

| REQ-FN-012 | HU-05 | Detectar recurso inexistente | GET /api/v1/votaciones/{votacionId} | Consultar una votación inexistente | votacion.service.js / errorHandler.js | CP-12 Votación inexistente |



\## Requerimientos no funcionales relacionados



| Requerimiento | Tipo | Descripción | Evidencia |

|---|---|---|---|

| REQ-NF-001 | Seguridad | El sistema debe proteger los endpoints mediante autenticación JWT y autorización por permisos. | JWT, middleware de autenticación y pruebas 401/403 |

| REQ-NF-002 | Rendimiento | El sistema debe utilizar Redis para reducir consultas repetitivas de resultados a PostgreSQL. | Cache-Aside con respuestas HIT y MISS |

| REQ-NF-003 | Consistencia | El sistema debe invalidar la caché de resultados después de registrar nuevos votos. | CACHE INVALIDATED en resultado.service.js |

| REQ-NF-004 | Auditoría | El sistema debe registrar eventos relevantes en MongoDB sin interrumpir la operación principal. | Colección auditoria de MongoDB |

| REQ-NF-005 | Seguridad | Las respuestas de error deben evitar exponer información interna sensible. | Middleware global de errores |

| REQ-NF-006 | Interoperabilidad | La API debe estar documentada bajo OpenAPI 3.0.3. | docs/api/openapi.yaml |

| REQ-NF-007 | Estandarización | Los errores HTTP deben utilizar application/problem+json conforme a RFC 9457. | ProblemDetails en OpenAPI y errorHandler.js |



\## Cobertura BDD



| Archivo | Historias relacionadas | Cobertura |

|---|---|---|

| features/autenticacion.feature | HU-01 | Login válido, perfil, falta de token, credenciales inválidas y bloqueo temporal |

| features/gestion\_electoral.feature | HU-05, HU-06, HU-07, HU-08, HU-09 | Votaciones, candidatos, mesas, resultados, caché Redis y escenarios de excepción |



\## Cobertura de pruebas Postman



| Caso | Resultado esperado |

|---|---|

| CP-01 | Login válido responde 200 y genera JWT |

| CP-02 | Perfil autenticado responde 200 |

| CP-03 | Creación de votación responde 201 |

| CP-04 | Listado de votaciones responde 200 |

| CP-05 | Registro de mesa responde 201 |

| CP-06 | Registro de candidato responde 201 |

| CP-07 | Registro de resultado responde 201 |

| CP-08 | Primera consulta de resultados responde 200 y cache MISS |

| CP-09 | Segunda consulta de resultados responde 200 y cache HIT |

| CP-10 | Resultado duplicado responde 409 |

| CP-11 | Solicitud sin JWT responde 401 |

| CP-12 | Votación inexistente responde 404 |

| CP-13 | Cantidad de votos negativa responde 400 |



\## Conclusión de trazabilidad



La matriz permite verificar que los requerimientos implementados poseen

relación directa con historias de usuario, contratos OpenAPI, escenarios

BDD, código fuente y pruebas de aceptación. De esta forma se mantiene

trazabilidad bidireccional entre análisis, diseño, implementación y

validación del sistema VotaGT.

