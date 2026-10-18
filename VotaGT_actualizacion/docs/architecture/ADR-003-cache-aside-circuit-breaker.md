\# ADR-003: Cache-Aside y Circuit Breaker para Redis



\## Estado



Aceptado



\## Fecha



Octubre 2026



\## Sistema



VotaGT - Sistema de Gestión Electoral



\---



\## 1. Contexto



VotaGT permite consultar resultados consolidados de una votación.



Estas consultas pueden repetirse frecuentemente y generar acceso innecesario a PostgreSQL.



Para mejorar el rendimiento se decidió utilizar Redis como caché temporal.



Sin embargo, Redis es un componente auxiliar y su indisponibilidad no debe provocar que la API deje de funcionar.



\---



\## 2. Problema arquitectónico



Se necesita una solución que permita:



\- Reducir consultas repetitivas a PostgreSQL.

\- Mantener los resultados temporalmente en memoria.

\- Actualizar la información cuando se registran nuevos resultados.

\- Evitar que una falla de Redis provoque la caída de la API.

\- Recuperar automáticamente el uso de Redis cuando vuelva a estar disponible.



\---



\## 3. Decisión



Se implementan conjuntamente:



\- Cache-Aside Pattern.

\- Gateway Pattern.

\- Circuit Breaker Pattern.



Redis se utiliza únicamente como mecanismo de optimización.



PostgreSQL permanece como fuente principal de los datos electorales.



\---



\## 4. Cache-Aside



El patrón Cache-Aside establece que la aplicación controla explícitamente la lectura y escritura de la caché.



\### Flujo de consulta



1\. El cliente solicita los resultados de una votación.

2\. `ResultadoService` solicita los datos al `CacheGateway`.

3\. El Gateway consulta Redis.

4\. Si la clave existe se produce un `CACHE HIT`.

5\. Los resultados se devuelven desde Redis.

6\. Si la clave no existe se produce un `CACHE MISS`.

7\. El sistema consulta PostgreSQL.

8\. Los resultados obtenidos se guardan temporalmente en Redis.

9\. La respuesta se devuelve al cliente.



\---



\## 5. Clave de caché



Se utiliza el formato:



`votagt:resultados:votacion:{votacionId}`



Ejemplo:



`votagt:resultados:votacion:7`



Esto permite mantener una caché independiente por votación.



\---



\## 6. TTL



La caché utiliza un tiempo de vida configurable.



Variable:



`REDIS\_TTL\_RESULTADOS`



Valor utilizado actualmente:



`60 segundos`



Una vez cumplido este tiempo, Redis elimina automáticamente la información almacenada.



\---



\## 7. Invalidación de caché



Cuando se registra un nuevo resultado electoral, la información almacenada en Redis puede quedar desactualizada.



Por esta razón se aplica invalidación explícita.



Flujo:



1\. Se registra el nuevo resultado en PostgreSQL.

2\. Se genera la clave de caché correspondiente.

3\. El `CacheGateway` elimina la clave en Redis.

4\. La siguiente consulta produce un `CACHE MISS`.

5\. PostgreSQL devuelve la información actualizada.

6\. Redis almacena nuevamente el resultado.



Este mecanismo evita servir resultados obsoletos después de una modificación.



\---



\## 8. Gateway Pattern



La lógica de negocio no accede directamente a Redis.



El acceso se realiza mediante:



`src/gateways/cache.gateway.js`



El Gateway encapsula operaciones como:



\- `obtener`

\- `guardar`

\- `eliminar`

\- `existe`



Esto reduce el acoplamiento entre `ResultadoService` y Redis.



\---



\## 9. Circuit Breaker



Redis puede fallar temporalmente.



Para evitar que cada solicitud continúe intentando utilizar un servicio no disponible, se implementa Circuit Breaker.



Archivo:



`src/patterns/circuitBreaker.js`



\### Estados



El circuito maneja los siguientes estados:



\- `CLOSED`

\- `OPEN`

\- `HALF\_OPEN`



\---



\## 10. Estado CLOSED



Es el estado normal.



Las operaciones hacia Redis se ejecutan normalmente.



Si se producen fallos consecutivos, el Circuit Breaker registra cada error.



Configuración actual:



`limiteFallos = 3`



Después de alcanzar el límite, el circuito pasa a `OPEN`.



\---



\## 11. Estado OPEN



Cuando el circuito está abierto, las solicitudes dejan de intentar utilizar Redis temporalmente.



En lugar de producir un error en toda la operación, el sistema utiliza PostgreSQL como fallback.



Ejemplo:



`CIRCUIT OPEN → Redis`



La API continúa respondiendo aunque Redis esté fuera de servicio.



\---



\## 12. Estado HALF\_OPEN



Después del periodo de recuperación, el Circuit Breaker permite un nuevo intento hacia Redis.



Configuración actual:



`tiempoReintento = 30000 ms`



Si Redis responde correctamente:



`HALF\_OPEN -> CLOSED`



Si vuelve a fallar:



`HALF\_OPEN -> OPEN`



\---



\## 13. Degradación controlada



Durante una caída de Redis, VotaGT opera en modo degradado.



Ejemplo de estado:



`Redis: DEGRADED`



Durante este estado:



\- PostgreSQL continúa disponible.

\- La API continúa respondiendo.

\- Las consultas de resultados siguen funcionando.

\- Únicamente se pierde temporalmente la optimización de caché.



Esto evita que Redis se convierta en un punto único de fallo.



\---



\## 14. Evidencia de comportamiento



Durante las pruebas se validó el siguiente flujo:



`Redis disponible`

\-> `CACHE MISS`

\-> `CACHE GUARDADA`

\-> `CACHE HIT`



También se probó:



`Redis no disponible`

\-> `FALLO 1/3`

\-> `FALLO 2/3`

\-> `FALLO 3/3`

\-> `CIRCUIT OPEN`

\-> `PostgreSQL continúa respondiendo`



Posteriormente se comprobó la recuperación:



`CIRCUIT HALF\_OPEN`

\-> `CIRCUIT CLOSED`

\-> `Redis nuevamente disponible`



\---



\## 15. Alternativas consideradas



\### Consultar siempre PostgreSQL



Esta alternativa sería más simple, pero produciría consultas repetitivas innecesarias.



\### Utilizar Redis sin Circuit Breaker



Fue descartado porque una falla de Redis podría generar retrasos o errores repetitivos en las solicitudes.



\### Utilizar Redis como fuente principal



Fue descartado porque Redis se utiliza como almacenamiento temporal y no debe reemplazar a PostgreSQL para la información electoral.



\---



\## 16. Consecuencias positivas



La decisión permite:



\- Reducir consultas repetitivas.

\- Mejorar tiempos de respuesta.

\- Mantener PostgreSQL como fuente de verdad.

\- Invalidar datos desactualizados.

\- Continuar operando cuando Redis falla.

\- Recuperar automáticamente el uso de Redis.

\- Desacoplar la lógica mediante Gateway Pattern.



\---



\## 17. Consecuencias negativas



La implementación agrega:



\- Mayor complejidad en la lógica de caché.

\- Necesidad de controlar invalidación.

\- Manejo de estados del Circuit Breaker.

\- Posibilidad temporal de operar sin caché.



Estas consecuencias son aceptables porque mejoran la resiliencia del sistema.



\---



\## 18. Resultado



Se adopta oficialmente:



\- Redis como caché temporal.

\- Cache-Aside como estrategia de acceso.

\- TTL configurable.

\- Invalidación explícita después de registrar resultados.

\- Gateway Pattern para desacoplar Redis.

\- Circuit Breaker para tolerancia a fallos.

\- PostgreSQL como fallback y fuente principal.



Esta decisión permite mejorar el rendimiento sin comprometer la disponibilidad de VotaGT.

