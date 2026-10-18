\# ADR-002: Persistencia Políglota



\## Estado



Aceptado



\## Fecha



Octubre 2026



\## Sistema



VotaGT - Sistema de Gestión Electoral



\---



\## 1. Contexto



VotaGT maneja diferentes tipos de información con características distintas.



Entre los datos administrados por el sistema se encuentran:



\- Usuarios.

\- Roles.

\- Permisos.

\- Votaciones.

\- Candidatos.

\- Mesas.

\- Resultados.

\- Eventos de auditoría.

\- Datos temporales de caché.

\- Relaciones entre usuarios, roles y permisos.



Utilizar una única tecnología de almacenamiento para todos estos casos limitaría la capacidad de aprovechar las fortalezas específicas de diferentes motores de base de datos.



\---



\## 2. Problema arquitectónico



Se necesita una estrategia de persistencia que permita:



\- Mantener consistencia e integridad en los datos electorales.

\- Registrar auditoría sin aumentar el acoplamiento del sistema.

\- Mejorar el rendimiento de consultas frecuentes.

\- Representar relaciones de autorización.

\- Permitir crecimiento independiente de ciertos componentes.



\---



\## 3. Decisión



Se adopta una arquitectura de persistencia políglota utilizando:



\- PostgreSQL.

\- MongoDB.

\- Redis.

\- Neo4j.



Cada tecnología tiene una responsabilidad específica dentro de VotaGT.



\---



\## 4. PostgreSQL



\### Responsabilidad



PostgreSQL es la fuente principal de datos transaccionales.



Almacena:



\- Usuarios.

\- Roles.

\- Permisos.

\- Votaciones.

\- Candidatos.

\- Mesas.

\- Resultados.



\### Motivo de selección



Se seleccionó PostgreSQL por su capacidad para proporcionar:



\- Transacciones ACID.

\- Integridad referencial.

\- Claves primarias.

\- Claves foráneas.

\- Restricciones `UNIQUE`.

\- Restricciones `CHECK`.

\- Consultas SQL.

\- Relaciones entre entidades.



La información electoral requiere consistencia fuerte, por lo que PostgreSQL es adecuado para mantener estos datos.



\---



\## 5. MongoDB



\### Responsabilidad



MongoDB se utiliza para almacenar los eventos de auditoría.



Base de datos:



`votagt\_audit`



Colección:



`auditoria`



Ejemplos de eventos:



\- `LOGIN\_EXITOSO`

\- `VOTACION\_CREADA`

\- `CANDIDATO\_CREADO`

\- `MESA\_CREADA`

\- `RESULTADO\_REGISTRADO`



\### Motivo de selección



Los registros de auditoría pueden variar según el tipo de evento.



MongoDB permite:



\- Documentos flexibles.

\- Crecimiento independiente.

\- Incorporación de nuevos campos.

\- Almacenamiento adecuado de eventos.



La auditoría está desacoplada de los servicios mediante Observer Pattern.



\---



\## 6. Redis



\### Responsabilidad



Redis se utiliza como almacenamiento temporal de caché.



Actualmente almacena resultados consolidados de las votaciones.



Ejemplo de clave:



`votagt:resultados:votacion:7`



Formato general:



`votagt:resultados:votacion:{votacionId}`



\### Patrón aplicado



Se utiliza:



`Cache-Aside`



El servicio consulta primero Redis.



Si existe información:



`CACHE HIT`



Si no existe:



`CACHE MISS`



Posteriormente consulta PostgreSQL y guarda temporalmente el resultado en Redis.



\### TTL



El tiempo de vida se configura mediante:



`REDIS\_TTL\_RESULTADOS`



En el ambiente actual se utiliza:



`60 segundos`



\### Invalidación



Cuando se registra un nuevo resultado, se elimina la clave relacionada con la votación.



La siguiente consulta obtiene información actualizada desde PostgreSQL y vuelve a generar la caché.



\---



\## 7. Neo4j



\### Responsabilidad



Neo4j se utiliza para representar las relaciones de autorización.



Modelo:



`Usuario -> TIENE\_ROL -> Rol -> OTORGA -> Permiso`



Ejemplo:



`admin -> ADMINISTRADOR -> REPORTES\_GENERAR`



\### Motivo de selección



Neo4j permite representar naturalmente relaciones mediante grafos.



Esto facilita:



\- Visualización.

\- Navegación entre relaciones.

\- Consultas sobre usuarios, roles y permisos.

\- Análisis de la estructura de autorización.



\---



\## 8. Tolerancia a fallos



Redis es un componente de optimización y no debe convertirse en un punto único de fallo.



Por esta razón se utiliza Circuit Breaker.



Estados utilizados:



\- `CLOSED`

\- `OPEN`

\- `HALF\_OPEN`



Cuando Redis falla repetidamente, el circuito pasa a `OPEN`.



Durante este estado, las consultas continúan utilizando PostgreSQL.



Después de un periodo de recuperación, el circuito pasa a `HALF\_OPEN`.



Si Redis vuelve a responder correctamente, regresa a `CLOSED`.



\---



\## 9. Alternativas consideradas



\### Utilizar únicamente PostgreSQL



Esta alternativa simplificaría la infraestructura.



Sin embargo, implicaría utilizar PostgreSQL también para:



\- Caché.

\- Auditoría.

\- Relaciones de grafo.



Esto aumentaría responsabilidades sobre una única base de datos y no aprovecharía las características de otros motores.



\### Utilizar únicamente MongoDB



Fue descartado porque los datos electorales presentan relaciones y restricciones donde PostgreSQL proporciona mejores garantías de integridad.



\### Eliminar Redis



El sistema podría funcionar directamente con PostgreSQL.



Sin embargo, se perdería la optimización de consultas repetitivas y la demostración de una estrategia Cache-Aside.



\### Eliminar Neo4j



Las relaciones de autorización podrían almacenarse únicamente en PostgreSQL.



Sin embargo, Neo4j permite representar y visualizar este dominio mediante un modelo de grafos.



\---



\## 10. Consecuencias positivas



La decisión permite:



\- Seleccionar el motor adecuado según el tipo de información.

\- Mantener consistencia transaccional en PostgreSQL.

\- Desacoplar la auditoría mediante MongoDB.

\- Mejorar rendimiento mediante Redis.

\- Representar relaciones mediante Neo4j.

\- Reducir dependencia de Redis mediante Circuit Breaker.

\- Escalar componentes independientemente.



\---



\## 11. Consecuencias negativas



La persistencia políglota también introduce complejidad.



Se deben administrar:



\- Cuatro tecnologías de almacenamiento.

\- Diferentes conexiones.

\- Configuraciones independientes.

\- Estrategias de respaldo.

\- Disponibilidad de cada motor.

\- Sincronización entre diferentes almacenes.



Por esta razón, PostgreSQL permanece como fuente principal de los datos transaccionales.



\---



\## 12. Consistencia



PostgreSQL mantiene consistencia fuerte para las operaciones electorales.



Redis contiene copias temporales de datos y utiliza invalidación para mantener actualizada la caché.



MongoDB recibe eventos de auditoría de forma desacoplada mediante Observer.



Neo4j mantiene una representación de las relaciones de autorización.



Los almacenes secundarios no sustituyen a PostgreSQL como fuente principal de los datos críticos.



\---



\## 13. Resultado



Se adopta oficialmente la estrategia de persistencia políglota:



\- PostgreSQL para persistencia transaccional.

\- MongoDB para auditoría.

\- Redis para caché.

\- Neo4j para relaciones de autorización.



Esta decisión permite que VotaGT aproveche las fortalezas de diferentes tecnologías manteniendo PostgreSQL como fuente principal de información electoral.

