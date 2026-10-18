\# Estrategia de Persistencia Políglota - VotaGT



\## 1. Introducción



El sistema VotaGT utiliza una estrategia de persistencia políglota, en la cual diferentes tecnologías de almacenamiento son utilizadas según el tipo de información y la necesidad arquitectónica.



La solución utiliza:



\- PostgreSQL para los datos transaccionales y relacionales.

\- MongoDB para auditoría y registro de eventos.

\- Redis para caché de resultados.

\- Neo4j para representar relaciones de autorización entre usuarios, roles y permisos.



Esta separación permite utilizar cada tecnología según sus principales fortalezas.



\---



\## 2. PostgreSQL



\### Propósito



PostgreSQL funciona como la base de datos principal del sistema.



Almacena información transaccional que requiere integridad referencial, consistencia y relaciones entre entidades.



\### Información almacenada



Entre las principales entidades se encuentran:



\- Usuarios

\- Roles

\- Permisos

\- Votaciones

\- Candidatos

\- Mesas

\- Resultados



\### Esquemas utilizados



El sistema utiliza principalmente los siguientes esquemas:



\- `auth`

\- `election`



\### Ejemplos



En el esquema `auth` se almacenan:



\- `usuarios`

\- `roles`

\- `permisos`

\- `usuario\_rol`

\- `rol\_permiso`

\- `sesiones`

\- `recuperacion\_password`



En el esquema `election` se almacenan:



\- `votaciones`

\- `candidatos`

\- `mesas`

\- `resultados`



\### Motivo de selección



PostgreSQL fue seleccionado porque permite:



\- Transacciones ACID.

\- Uso de claves primarias y foráneas.

\- Restricciones `UNIQUE`.

\- Restricciones `CHECK`.

\- Integridad referencial.

\- Consultas SQL.

\- Manejo de relaciones entre entidades.



Por estas razones es adecuado para mantener la información crítica del proceso electoral.



\---



\## 3. MongoDB



\### Propósito



MongoDB se utiliza para almacenar eventos de auditoría.



Los eventos de auditoría no requieren la misma estructura relacional que las entidades principales y pueden crecer de manera independiente.



\### Colección utilizada



Base de datos:



`votagt\_audit`



Colección:



`auditoria`



\### Ejemplos de eventos



El sistema registra eventos como:



\- `LOGIN\_EXITOSO`

\- `VOTACION\_CREADA`

\- `CANDIDATO\_CREADO`

\- `MESA\_CREADA`

\- `RESULTADO\_REGISTRADO`



Cada documento puede almacenar información como:



\- Tipo de evento.

\- Usuario.

\- Recurso afectado.

\- Identificador del recurso.

\- Descripción.

\- Fecha del evento.



\### Motivo de selección



MongoDB fue seleccionado porque:



\- Permite documentos flexibles.

\- Es adecuado para registros de auditoría.

\- Permite agregar nuevos campos sin modificar un esquema rígido.

\- Facilita el almacenamiento de eventos.

\- Puede escalar independientemente de PostgreSQL.



La auditoría se encuentra desacoplada mediante el patrón Observer.



\---



\## 4. Redis



\### Propósito



Redis se utiliza como almacenamiento temporal para implementar caché.



Actualmente se utiliza para acelerar la consulta de resultados consolidados de una votación.



\### Patrón utilizado



El patrón utilizado es:



`Cache-Aside`



\### Flujo de lectura



1\. El cliente solicita los resultados.

2\. La API consulta Redis.

3\. Si los datos existen se produce un `CACHE HIT`.

4\. Los datos se devuelven directamente desde Redis.

5\. Si los datos no existen se produce un `CACHE MISS`.

6\. El sistema consulta PostgreSQL.

7\. Los resultados obtenidos se almacenan en Redis.

8\. Finalmente se responde al cliente.



\### Clave utilizada



Ejemplo:



`votagt:resultados:votacion:7`



Formato general:



`votagt:resultados:votacion:{votacionId}`



\### TTL



El tiempo de vida de la caché se configura mediante:



`REDIS\_TTL\_RESULTADOS`



En el entorno actual:



`60 segundos`



\### Invalidación



Cuando se registra un nuevo resultado electoral, la clave correspondiente a la votación se elimina de Redis.



De esta manera, la siguiente consulta produce un `CACHE MISS` y recupera información actualizada desde PostgreSQL.



\### Tolerancia a fallos



Redis está protegido mediante un Circuit Breaker.



Después de múltiples fallos consecutivos, el circuito pasa de:



`CLOSED`



a:



`OPEN`



Mientras el circuito está abierto, el sistema continúa obteniendo los resultados desde PostgreSQL.



Después del tiempo configurado, el circuito pasa a:



`HALF\_OPEN`



Si Redis responde correctamente, vuelve a:



`CLOSED`



Esto permite que una falla de Redis no provoque la caída completa de la API.



\---



\## 5. Neo4j



\### Propósito



Neo4j se utiliza para representar relaciones de autorización.



Permite modelar de manera gráfica las relaciones entre:



\- Usuarios

\- Roles

\- Permisos



\### Modelo conceptual



Ejemplo:



`Usuario -> TIENE\_ROL -> Rol -> OTORGA -> Permiso`



Ejemplo real:



`admin -> ADMINISTRADOR -> RESULTADOS\_REGISTRAR`



\### Motivo de selección



Neo4j fue seleccionado porque las relaciones entre usuarios, roles y permisos pueden representarse naturalmente mediante nodos y relaciones.



También permite visualizar y consultar fácilmente el grafo de autorización.



\---



\## 6. Distribución de responsabilidades



| Tecnología | Uso principal | Tipo de información |

|---|---|---|

| PostgreSQL | Persistencia principal | Datos transaccionales |

| MongoDB | Auditoría | Eventos y registros |

| Redis | Caché | Datos temporales |

| Neo4j | Autorización | Relaciones usuario-rol-permiso |



\---



\## 7. Arquitectura de persistencia



El flujo general del sistema puede representarse de la siguiente forma:



Cliente

&#x20; |

&#x20; v

API REST Node.js

&#x20; |

&#x20; +---- PostgreSQL

&#x20; |       Datos transaccionales

&#x20; |

&#x20; +---- Redis

&#x20; |       Caché de resultados

&#x20; |

&#x20; +---- MongoDB

&#x20; |       Auditoría

&#x20; |

&#x20; +---- Neo4j

&#x20;         Relaciones de autorización



\---



\## 8. Beneficios de la persistencia políglota



La arquitectura implementada permite:



\- Utilizar la tecnología más adecuada para cada tipo de información.

\- Reducir carga sobre PostgreSQL mediante Redis.

\- Separar la auditoría de las operaciones transaccionales.

\- Representar relaciones complejas mediante Neo4j.

\- Mantener integridad transaccional en PostgreSQL.

\- Mejorar la disponibilidad mediante Circuit Breaker.

\- Facilitar el crecimiento independiente de cada componente.



\---



\## 9. Conclusión



VotaGT implementa una arquitectura de persistencia políglota utilizando PostgreSQL, MongoDB, Redis y Neo4j.



PostgreSQL mantiene la información crítica del sistema electoral, MongoDB almacena la auditoría, Redis mejora el rendimiento mediante Cache-Aside y Neo4j representa las relaciones de autorización.



La integración de estas tecnologías permite que cada tipo de información sea administrado mediante la solución que mejor se adapta a sus características.

