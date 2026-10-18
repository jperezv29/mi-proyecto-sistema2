\# ADR-001: Arquitectura Monolito Modular con API REST



\## Estado



Aceptado



\## Fecha



Octubre 2026



\## Sistema



VotaGT - Sistema de Gestión Electoral



\---



\## 1. Contexto



VotaGT requiere administrar diferentes funciones relacionadas con un proceso electoral, entre ellas:



\- Autenticación y autorización.

\- Gestión de votaciones.

\- Gestión de candidatos.

\- Gestión de mesas.

\- Registro de resultados.

\- Consulta de resultados.

\- Generación de reportes.

\- Auditoría de operaciones.



El sistema debe permitir separar las responsabilidades internas para facilitar el mantenimiento, pero sin introducir la complejidad operativa de una arquitectura distribuida basada completamente en microservicios.



Además, los módulos deben poder ser consumidos mediante una interfaz estándar por aplicaciones cliente u otros componentes.



\---



\## 2. Problema arquitectónico



Se necesita definir una arquitectura que permita:



\- Separar las responsabilidades del sistema.

\- Evitar acoplamiento excesivo.

\- Facilitar pruebas y mantenimiento.

\- Exponer las funcionalidades mediante una API.

\- Permitir crecimiento futuro.

\- Mantener una implementación viable para el alcance actual del proyecto.



\---



\## 3. Decisión



Se adopta una arquitectura de:



\*\*Monolito Modular con API REST\*\*



La aplicación se ejecuta como una única aplicación Node.js, pero internamente se organiza mediante módulos y capas con responsabilidades claramente separadas.



La comunicación con los clientes se realiza mediante una API REST basada en HTTP.



\---



\## 4. Estructura de la solución



La aplicación utiliza una organización similar a:



src/

├── config/

├── controllers/

├── services/

├── repositories/

├── routes/

├── middlewares/

├── gateways/

├── events/

├── strategies/

├── patterns/

├── audit/

├── graph/

└── app.js



Cada directorio tiene una responsabilidad específica.



\---



\## 5. Responsabilidades principales



\### Controllers



Reciben las solicitudes HTTP y delegan la lógica de negocio a los servicios.



Ejemplo:



`resultado.controller.js`



\### Services



Contienen las reglas de negocio y coordinan las operaciones.



Ejemplos:



\- `auth.service.js`

\- `votacion.service.js`

\- `candidato.service.js`

\- `mesa.service.js`

\- `resultado.service.js`



\### Repositories



Encapsulan el acceso a la base de datos relacional.



La lógica de negocio no necesita conocer directamente las consultas SQL utilizadas.



\### Routes



Definen los endpoints disponibles en la API REST.



\### Middlewares



Gestionan responsabilidades transversales como:



\- Autenticación JWT.

\- Autorización por permisos.

\- Manejo centralizado de errores.



\### Gateways



Encapsulan el acceso a servicios externos o infraestructura.



Actualmente Redis es accedido mediante:



`cache.gateway.js`



\### Events



Implementan comunicación desacoplada mediante Observer.



Los servicios publican eventos y el Audit Observer registra las operaciones en MongoDB.



\### Strategies



Permiten cambiar algoritmos de comportamiento durante la ejecución.



Actualmente se utiliza Strategy para generar resultados en:



\- JSON.

\- CSV.



\### Patterns



Contiene componentes reutilizables relacionados con patrones arquitectónicos, como:



`circuitBreaker.js`



\---



\## 6. API REST



La API utiliza el prefijo:



`/api/v1`



Ejemplos de recursos:



`/api/v1/auth`



`/api/v1/votaciones`



`/api/v1/votaciones/{id}/candidatos`



`/api/v1/votaciones/{id}/mesas`



`/api/v1/votaciones/{id}/resultados`



La API se documenta mediante OpenAPI 3.0.3.



\---



\## 7. Patrones utilizados



La arquitectura incorpora los siguientes patrones:



\### Repository Pattern



Separa la lógica de negocio del acceso a PostgreSQL.



\### Gateway Pattern



Encapsula el acceso a Redis.



\### Observer Pattern



Desacopla la generación de eventos de auditoría de su almacenamiento en MongoDB.



\### Circuit Breaker Pattern



Evita que una falla temporal de Redis provoque la caída de las operaciones principales.



\### Strategy Pattern



Permite seleccionar dinámicamente el formato de exportación de resultados.



\---



\## 8. Alternativas consideradas



\### Arquitectura monolítica tradicional



Fue descartada porque podría generar un alto acoplamiento entre los diferentes componentes del sistema.



\### Microservicios



Se consideró separar autenticación, elecciones, resultados y auditoría en servicios independientes.



Sin embargo, esta alternativa incrementaría la complejidad relacionada con:



\- Despliegue.

\- Comunicación entre servicios.

\- Seguridad distribuida.

\- Observabilidad.

\- Consistencia de datos.

\- Administración de infraestructura.



Para el alcance actual del proyecto, dicha complejidad no resulta necesaria.



\### Monolito Modular



Fue seleccionado porque permite obtener separación lógica entre módulos sin asumir todavía el costo operativo de los microservicios.



\---



\## 9. Consecuencias positivas



La decisión permite:



\- Separar responsabilidades.

\- Mantener un único despliegue.

\- Facilitar el desarrollo y las pruebas.

\- Reducir complejidad operativa.

\- Utilizar patrones de diseño.

\- Exponer funcionalidades mediante API REST.

\- Facilitar una futura separación de módulos si el sistema crece.

\- Organizar el código de manera mantenible.



\---



\## 10. Consecuencias negativas



La arquitectura también presenta algunas limitaciones:



\- Todos los módulos comparten el mismo proceso Node.js.

\- Una falla crítica del proceso puede afectar toda la API.

\- El despliegue se realiza como una unidad.

\- El escalamiento independiente de cada módulo es limitado.



Estas limitaciones son aceptables para el alcance actual del sistema.



\---



\## 11. Relación con atributos de calidad



\### Mantenibilidad



La división por capas y módulos facilita cambios localizados.



\### Seguridad



La autenticación y autorización están centralizadas mediante JWT y permisos.



\### Rendimiento



Redis permite reducir consultas repetitivas a PostgreSQL.



\### Disponibilidad



Circuit Breaker permite continuar consultando PostgreSQL cuando Redis no está disponible.



\### Auditabilidad



Observer y MongoDB permiten registrar eventos relevantes sin acoplar directamente los servicios a la base de auditoría.



\### Interoperabilidad



La API REST proporciona una interfaz estándar basada en HTTP.



\---



\## 12. Resultado



Se adopta oficialmente la arquitectura:



\*\*Monolito Modular + API REST\*\*



Esta arquitectura satisface las necesidades actuales de VotaGT y permite evolucionar el sistema posteriormente sin introducir complejidad distribuida innecesaria desde el inicio.

