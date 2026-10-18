\# Gestión Ágil del Proyecto - VotaGT



\## 1. Marco de trabajo



El proyecto VotaGT utiliza principios de Scrum y gestión incremental.



El trabajo se organiza mediante:



\- Historias de Usuario.

\- Priorización.

\- Criterios de aceptación.

\- Pruebas BDD.

\- Evidencias de implementación.

\- Incrementos funcionales.



El objetivo es entregar funcionalidades verificables de forma progresiva.



\---



\# 2. Rol del Analista / Product Owner



El Analista / Product Owner representa las necesidades del usuario y del negocio dentro del proyecto.



Sus responsabilidades principales son:



\- Definir y mantener el Product Backlog.

\- Priorizar funcionalidades.

\- Aclarar requisitos.

\- Definir criterios de aceptación.

\- Validar que las historias generen valor.

\- Coordinar la relación entre requerimientos, diseño y desarrollo.

\- Verificar que el incremento desarrollado cumpla con el objetivo esperado.

\- Mantener trazabilidad entre historias, BDD, API y pruebas.



\---



\# 3. Product Backlog



| ID | Historia de Usuario | Prioridad | Estado |

|---|---|---|---|

| HU-01 | Como usuario quiero iniciar sesión para acceder al sistema de acuerdo con mis permisos. | Alta | Implementado |

| HU-02 | Como administrador quiero crear usuarios para permitir el acceso de nuevos operadores al sistema. | Alta | Pendiente |

| HU-03 | Como administrador quiero editar usuarios para mantener actualizada su información. | Media | Pendiente |

| HU-04 | Como administrador quiero administrar roles y permisos para controlar el acceso a las funcionalidades. | Alta | Pendiente |

| HU-05 | Como administrador quiero crear votaciones para configurar nuevos procesos electorales. | Alta | Implementado |

| HU-06 | Como operador quiero registrar mesas para organizar los puntos de captura de resultados. | Alta | Implementado |

| HU-07 | Como operador quiero registrar candidatos para asociarlos a una votación. | Alta | Implementado |

| HU-08 | Como digitador quiero registrar resultados para almacenar los votos obtenidos por cada candidato. | Alta | Implementado |

| HU-09 | Como supervisor quiero consultar resultados para conocer el estado consolidado de una votación. | Alta | Implementado |

| HU-10 | Como usuario autorizado quiero exportar resultados en CSV para utilizarlos en análisis externos. | Media | Implementado |

| HU-11 | Como equipo de desarrollo quiero ejecutar pruebas automatizadas para comprobar el comportamiento del sistema. | Alta | Implementado |

| HU-12 | Como equipo de proyecto quiero documentar la solución para facilitar su mantenimiento y evaluación. | Media | En progreso |



\---



\# 4. Historias de Usuario bajo las 3C



\## HU-01 - Iniciar sesión



\### Card



Como usuario quiero iniciar sesión para acceder al sistema de acuerdo con mis permisos.



\### Conversation



El sistema deberá validar usuario y contraseña.



Las contraseñas deberán verificarse mediante hash.



Cuando las credenciales sean válidas, el sistema deberá generar un token JWT.



Los intentos incorrectos deberán ser controlados sin revelar información sensible.



\### Confirmation



\- Credenciales válidas producen HTTP 200.

\- Se genera un JWT.

\- Credenciales inválidas producen HTTP 401.

\- Una cuenta bloqueada no deberá acceder al sistema.

\- El inicio exitoso deberá producir un evento de auditoría.



\---



\## HU-05 - Crear votación



\### Card



Como administrador quiero crear votaciones para configurar nuevos procesos electorales.



\### Conversation



La votación debe incluir nombre, fechas y datos descriptivos.



La fecha de finalización debe ser posterior a la fecha de inicio.



Solo un usuario autorizado podrá crear la votación.



\### Confirmation



\- Datos válidos producen HTTP 201.

\- Fechas inválidas producen HTTP 400.

\- Usuario sin autorización produce HTTP 403.

\- La votación queda almacenada en PostgreSQL.

\- Se genera el evento `VOTACION\_CREADA`.



\---



\## HU-06 - Gestionar mesas



\### Card



Como operador quiero registrar mesas para organizar los puntos donde se reportan resultados.



\### Conversation



Cada mesa deberá pertenecer a una votación.



Cada mesa debe poseer un código y nombre.



El código no puede repetirse dentro de la misma votación.



\### Confirmation



\- Mesa válida produce HTTP 201.

\- Código duplicado produce HTTP 409.

\- Votación inexistente produce HTTP 404.

\- La mesa queda asociada a la votación correcta.



\---



\## HU-07 - Gestionar candidatos



\### Card



Como operador quiero registrar candidatos para asociarlos a un proceso electoral.



\### Conversation



Cada candidato pertenece a una votación.



El nombre y cargo son obligatorios.



El número de lista es opcional, pero si se utiliza debe ser único dentro de la votación.



\### Confirmation



\- Candidato válido produce HTTP 201.

\- Número de lista duplicado produce HTTP 409.

\- Datos inválidos producen HTTP 400.

\- Votación inexistente produce HTTP 404.



\---



\## HU-08 - Registrar resultados



\### Card



Como digitador quiero registrar resultados para almacenar los votos obtenidos por cada candidato.



\### Conversation



El sistema debe validar votación, mesa y candidato.



Los votos deben ser enteros mayores o iguales a cero.



No debe existir un resultado duplicado para la misma combinación de mesa y candidato.



\### Confirmation



\- Registro válido produce HTTP 201.

\- Votos inválidos producen HTTP 400.

\- Recursos inexistentes producen HTTP 404.

\- Resultado duplicado produce HTTP 409.

\- La caché relacionada se invalida.

\- Se genera auditoría.



\---



\## HU-09 - Consultar resultados



\### Card



Como supervisor quiero consultar resultados consolidados para conocer el avance de una votación.



\### Conversation



El sistema debe consultar primero Redis.



Si existe caché válida, deberá utilizarla.



Si no existe, deberá consultar PostgreSQL y almacenar temporalmente la respuesta.



\### Confirmation



\- Primera consulta sin caché produce `MISS`.

\- Consulta posterior produce `HIT`.

\- La información contiene totales y resultados por candidato.

\- Si Redis falla, PostgreSQL deberá continuar respondiendo.



\---



\## HU-10 - Exportar resultados



\### Card



Como usuario autorizado quiero exportar resultados para utilizarlos fuera del sistema.



\### Conversation



La exportación deberá soportar JSON y CSV.



La selección del formato se realizará mediante Strategy Pattern.



El usuario deberá poseer el permiso `REPORTES\_GENERAR`.



\### Confirmation



\- CSV válido produce HTTP 200 y `text/csv`.

\- JSON válido produce HTTP 200 y `application/json`.

\- Formato no soportado produce HTTP 400.

\- Usuario sin permiso produce HTTP 403.



\---



\# 5. Historias pendientes



Las siguientes historias pertenecen al Product Backlog, pero no deben considerarse finalizadas mientras no exista implementación ejecutable y evidencia de prueba:



\- HU-02 Crear usuarios.

\- HU-03 Editar usuarios.

\- HU-04 Administrar roles y permisos.



Estas historias permanecen disponibles para incrementos posteriores.



\---



\# 6. Validación INVEST



Las historias de usuario se evalúan utilizando INVEST.



| Criterio | Aplicación en VotaGT |

|---|---|

| Independent | Cada historia representa una capacidad de negocio identificable. |

| Negotiable | Los detalles de implementación pueden ajustarse sin cambiar el objetivo principal. |

| Valuable | Cada historia proporciona valor a un actor del sistema. |

| Estimable | El alcance permite estimar el esfuerzo necesario. |

| Small | Las historias están limitadas a una funcionalidad concreta. |

| Testable | Cada historia posee criterios de aceptación verificables. |



Las historias implementadas cuentan además con pruebas mediante BDD, Postman y/o pruebas automatizadas.



\---



\# 7. Definition of Ready - DoR



Una Historia de Usuario se considera lista para iniciar cuando:



\- Tiene identificador único.

\- Está redactada en formato Como / Quiero / Para.

\- El actor está identificado.

\- El objetivo de negocio está claro.

\- Tiene criterios de aceptación.

\- Sus reglas de negocio están identificadas.

\- Se conocen las dependencias principales.

\- Es posible estimarla.

\- No existen dudas críticas que impidan comenzar su desarrollo.



\---



\# 8. Definition of Done - DoD



Una Historia de Usuario se considera terminada cuando:



\- El código correspondiente está implementado.

\- La funcionalidad puede ejecutarse.

\- Los criterios de aceptación se cumplen.

\- Los errores esperados están controlados.

\- El endpoint está documentado cuando corresponde.

\- La funcionalidad ha sido probada.

\- Las pruebas automatizadas relacionadas finalizan correctamente.

\- La evidencia se encuentra disponible.

\- La trazabilidad ha sido actualizada.

\- La documentación técnica ha sido actualizada cuando corresponde.



\---



\# 9. Priorización



Se utiliza una priorización basada principalmente en valor funcional y dependencias.



Las funcionalidades críticas para el MVP son:



\- Autenticación.

\- Votaciones.

\- Candidatos.

\- Mesas.

\- Registro de resultados.

\- Consulta de resultados.



La exportación, automatización de pruebas y documentación complementan el incremento funcional.



Las funciones administrativas completas de usuarios y roles pueden continuar en posteriores incrementos.



\---



\# 10. Relación con BDD



Las Historias de Usuario se relacionan con escenarios definidos en:



`features/autenticacion.feature`



y:



`features/gestion\_electoral.feature`



Los escenarios permiten comprobar:



\- Caminos exitosos.

\- Validaciones.

\- Errores.

\- Recursos inexistentes.

\- Conflictos.

\- Caché.

\- Exportación.



\---



\# 11. Trazabilidad



La relación entre:



\- Historia de Usuario.

\- Requisito.

\- Endpoint.

\- BDD.

\- Código.

\- Prueba.



se encuentra documentada en:



`docs/agile/matriz\_trazabilidad.md`



\---



\# 12. Conclusión



La gestión ágil de VotaGT permite relacionar los objetivos de negocio con funcionalidades implementables y verificables.



La aplicación de 3C, INVEST, DoR y DoD proporciona criterios claros para definir, desarrollar, probar y aceptar cada incremento del sistema.

