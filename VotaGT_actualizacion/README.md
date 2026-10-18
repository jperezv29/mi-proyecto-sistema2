# mi-proyecto-sistema2

# Sistema de Gestión Electoral

## Descripción

El **Sistema de Gestión Electoral** es una aplicación desarrollada bajo una arquitectura **Monolito Modular + API REST**, orientada a la administración de procesos electorales de forma segura, mantenible y escalable.

La aplicación se encuentra dividida internamente en módulos y utiliza diferentes bases de datos según la responsabilidad de la información.

## Arquitectura

La arquitectura seleccionada es:

**Monolito Modular + API REST + separación de bases de datos por responsabilidad**

El sistema mantiene una única aplicación desplegable, pero separa las funcionalidades mediante módulos independientes.

## Módulos Principales

- **Autenticación e Identidad:** inicio de sesión, usuarios, credenciales y JWT.
- **Control de Acceso:** roles, permisos y autorización.
- **Votaciones:** creación, consulta y administración de procesos electorales.
- **Candidatos:** registro y administración de candidatos.
- **Mesas:** gestión de mesas electorales.
- **Resultados:** registro, validación y consulta de resultados.
- **Reportes:** estadísticas, consultas y exportaciones CSV.
- **Auditoría:** registro de eventos e historial de cambios.

## Bases de Datos

### IdentityDB

Almacena:

- Usuarios.
- Credenciales.
- Roles.
- Permisos.
- Sesiones.

### ElectionDB

Almacena:

- Votaciones.
- Candidatos.
- Mesas.
- Resultados.

### ReportingDB

Almacena:

- Reportes.
- Estadísticas.
- Agregaciones.
- Consultas analíticas.

### AuditDB

Almacena:

- Eventos del sistema.
- Historial de operaciones.
- Cambios realizados.
- Información de auditoría.

## API REST

Las funcionalidades principales son expuestas mediante una API REST.

Ruta base:

```text
/api/v1
```

Endpoints principales:

```http
POST   /api/v1/auth/login

GET    /api/v1/votaciones
POST   /api/v1/votaciones
GET    /api/v1/votaciones/{id}
PUT    /api/v1/votaciones/{id}
PATCH  /api/v1/votaciones/{id}
DELETE /api/v1/votaciones/{id}

GET    /api/v1/votaciones/{id}/candidatos
POST   /api/v1/votaciones/{id}/candidatos

POST   /api/v1/resultados
GET    /api/v1/votaciones/{id}/resultados
```

## Seguridad

La API utiliza autenticación mediante **JWT (JSON Web Token)**.

Después de iniciar sesión, el cliente recibe un token que debe enviarse en las solicitudes protegidas:

```http
Authorization: Bearer <token>
```

El sistema contempla además:

- Control de acceso mediante roles y permisos.
- Validación de datos.
- Hash seguro de contraseñas.
- Expiración de tokens.
- Auditoría de operaciones.
- Consultas parametrizadas.
- Uso de HTTPS en producción.

## Documentación OpenAPI

La especificación de la API se encuentra en:

```text
docs/api/openapi.yaml
```

La documentación utiliza:

```yaml
openapi: 3.0.3
```

Puede visualizarse y probarse mediante **Swagger UI** o **Swagger Editor**.

## Códigos HTTP

### Respuestas exitosas

- `200 OK`
- `201 Created`
- `204 No Content`

### Respuestas de error

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

## Tecnologías Principales

- PHP.
- MySQL / MariaDB.
- API REST.
- OpenAPI 3.0.3.
- Swagger UI.
- JWT.
- Arquitectura Monolito Modular.
- Bases de datos relacionales.
- Auditoría basada en eventos.
- Transactional Outbox.

## Estructura General del Proyecto

```text
sistema_votaciones/
│
├── app/
│   └── Modules/
│       ├── Identity/
│       ├── AccessControl/
│       ├── Elections/
│       ├── Candidates/
│       ├── Tables/
│       ├── Results/
│       ├── Reports/
│       └── Audit/
│
├── api/
│   └── v1/
│
├── config/
│
├── docs/
│   └── api/
│       └── openapi.yaml
│
├── public/
│
├── tests/
│
├── .env
└── README.md
```

## Objetivos del Proyecto

- Garantizar la integridad de la información electoral.
- Mantener trazabilidad de las operaciones.
- Mejorar la mantenibilidad del sistema.
- Reducir el acoplamiento entre funcionalidades.
- Evitar que los reportes afecten las operaciones críticas.
- Centralizar la seguridad mediante la API REST.
- Permitir la integración con otros sistemas.
- Facilitar futuras mejoras arquitectónicas.

## Ejecución del Proyecto

En un entorno local con XAMPP, el sistema puede ejecutarse desde:

```text
C:\xampp\htdocs\sistema_votaciones
```

Ejemplo de acceso:

```text
http://localhost/sistema_votaciones/
```

Ruta base de la API:

```text
http://localhost/sistema_votaciones/api/v1
```
