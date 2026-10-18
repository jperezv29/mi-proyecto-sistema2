
SET NAMES utf8mb4;
SET time_zone = '-06:00';

CREATE DATABASE IF NOT EXISTS IdentityDB
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS ElectionDB
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS ReportingDB
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS AuditDB
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- IDENTITYDB
-- ============================================================

USE IdentityDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username            VARCHAR(80) NOT NULL,
    email               VARCHAR(150) NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    nombres             VARCHAR(120) NOT NULL,
    apellidos           VARCHAR(120) NOT NULL,
    estado              ENUM('ACTIVO','BLOQUEADO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    intentos_fallidos   INT UNSIGNED NOT NULL DEFAULT 0,
    bloqueado_hasta     DATETIME NULL,
    ultimo_login        DATETIME NULL,
    creado_en           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuarios_username UNIQUE (username),
    CONSTRAINT uq_usuarios_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roles (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(60) NOT NULL,
    descripcion     VARCHAR(255) NULL,
    creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_roles_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permisos (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo          VARCHAR(100) NOT NULL,
    descripcion     VARCHAR(255) NULL,
    creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_permisos_codigo UNIQUE (codigo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuario_rol (
    usuario_id      BIGINT UNSIGNED NOT NULL,
    rol_id          BIGINT UNSIGNED NOT NULL,
    asignado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, rol_id),
    CONSTRAINT fk_usuario_rol_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_usuario_rol_rol
        FOREIGN KEY (rol_id) REFERENCES roles(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rol_permiso (
    rol_id          BIGINT UNSIGNED NOT NULL,
    permiso_id      BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (rol_id, permiso_id),
    CONSTRAINT fk_rol_permiso_rol
        FOREIGN KEY (rol_id) REFERENCES roles(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_rol_permiso_permiso
        FOREIGN KEY (permiso_id) REFERENCES permisos(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sesiones (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id          BIGINT UNSIGNED NOT NULL,
    jti                 VARCHAR(120) NOT NULL,
    refresh_token_hash  VARCHAR(255) NULL,
    ip_origen           VARCHAR(45) NULL,
    user_agent          VARCHAR(500) NULL,
    expira_en           DATETIME NOT NULL,
    revocada            BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sesiones_jti UNIQUE (jti),
    CONSTRAINT fk_sesiones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recuperacion_password (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id      BIGINT UNSIGNED NOT NULL,
    token_hash      VARCHAR(255) NOT NULL,
    expira_en       DATETIME NOT NULL,
    usado           BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recuperacion_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_usuarios_estado
    ON usuarios (estado);

CREATE INDEX idx_sesiones_usuario_expira
    ON sesiones (usuario_id, expira_en);

INSERT IGNORE INTO roles (nombre, descripcion) VALUES
('ADMINISTRADOR', 'Administración general del sistema electoral'),
('DIGITADOR', 'Registro y actualización autorizada de resultados'),
('SUPERVISOR', 'Consulta de avances, resultados e inconsistencias'),
('CONSULTA', 'Consulta de información electoral publicada');

INSERT IGNORE INTO permisos (codigo, descripcion) VALUES
('USUARIOS_GESTIONAR', 'Gestionar usuarios, roles y permisos'),
('VOTACIONES_GESTIONAR', 'Crear y modificar procesos electorales'),
('CANDIDATOS_GESTIONAR', 'Crear y modificar candidatos'),
('MESAS_GESTIONAR', 'Crear y modificar mesas electorales'),
('RESULTADOS_REGISTRAR', 'Registrar resultados electorales'),
('RESULTADOS_CONSULTAR', 'Consultar resultados electorales'),
('REPORTES_GENERAR', 'Generar reportes y exportaciones'),
('AUDITORIA_CONSULTAR', 'Consultar trazabilidad y auditoría');

-- ============================================================
-- ELECTIONDB
-- ============================================================

USE ElectionDB;

CREATE TABLE IF NOT EXISTS votaciones (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    descripcion     VARCHAR(500) NULL,
    fecha_inicio    DATETIME NOT NULL,
    fecha_fin       DATETIME NOT NULL,
    estado          ENUM('PROGRAMADA','ABIERTA','CERRADA','CANCELADA')
                    NOT NULL DEFAULT 'PROGRAMADA',
    creado_por      BIGINT UNSIGNED NOT NULL,
    creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_votacion_fechas CHECK (fecha_fin > fecha_inicio)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS candidatos (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    votacion_id     BIGINT UNSIGNED NOT NULL,
    nombre          VARCHAR(150) NOT NULL,
    partido         VARCHAR(150) NULL,
    numero_lista    INT UNSIGNED NULL,
    estado          ENUM('ACTIVO','INACTIVO','RETIRADO') NOT NULL DEFAULT 'ACTIVO',
    creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidatos_votacion
        FOREIGN KEY (votacion_id) REFERENCES votaciones(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_candidato_votacion_nombre UNIQUE (votacion_id, nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mesas (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    votacion_id         BIGINT UNSIGNED NOT NULL,
    codigo              VARCHAR(40) NOT NULL,
    centro_votacion     VARCHAR(180) NOT NULL,
    departamento        VARCHAR(100) NULL,
    municipio           VARCHAR(100) NULL,
    estado              ENUM('PENDIENTE','ABIERTA','CERRADA','VALIDADA')
                        NOT NULL DEFAULT 'PENDIENTE',
    total_empadronados  INT UNSIGNED NULL,
    creado_en           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mesas_votacion
        FOREIGN KEY (votacion_id) REFERENCES votaciones(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_mesa_codigo_votacion UNIQUE (votacion_id, codigo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resultados (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    votacion_id     BIGINT UNSIGNED NOT NULL,
    mesa_id         BIGINT UNSIGNED NOT NULL,
    candidato_id    BIGINT UNSIGNED NOT NULL,
    votos           INT UNSIGNED NOT NULL DEFAULT 0,
    registrado_por  BIGINT UNSIGNED NOT NULL,
    registrado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resultados_votacion
        FOREIGN KEY (votacion_id) REFERENCES votaciones(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_resultados_mesa
        FOREIGN KEY (mesa_id) REFERENCES mesas(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_resultados_candidato
        FOREIGN KEY (candidato_id) REFERENCES candidatos(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_resultado_mesa_candidato UNIQUE (mesa_id, candidato_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cierre_mesa (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mesa_id             BIGINT UNSIGNED NOT NULL,
    total_votos_validos INT UNSIGNED NOT NULL DEFAULT 0,
    votos_nulos         INT UNSIGNED NOT NULL DEFAULT 0,
    votos_blancos       INT UNSIGNED NOT NULL DEFAULT 0,
    observaciones       VARCHAR(1000) NULL,
    cerrado_por         BIGINT UNSIGNED NOT NULL,
    cerrado_en          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_cierre_mesa UNIQUE (mesa_id),
    CONSTRAINT fk_cierre_mesa
        FOREIGN KEY (mesa_id) REFERENCES mesas(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_outbox (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    aggregate_type      VARCHAR(80) NOT NULL,
    aggregate_id        VARCHAR(100) NOT NULL,
    event_type          VARCHAR(100) NOT NULL,
    payload             JSON NOT NULL,
    estado              ENUM('PENDIENTE','PROCESANDO','PROCESADO','ERROR')
                        NOT NULL DEFAULT 'PENDIENTE',
    intentos            INT UNSIGNED NOT NULL DEFAULT 0,
    disponible_desde    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    procesado_en        DATETIME NULL,
    creado_en           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_votaciones_estado_fecha
    ON votaciones (estado, fecha_inicio, fecha_fin);

CREATE INDEX idx_candidatos_votacion_estado
    ON candidatos (votacion_id, estado);

CREATE INDEX idx_mesas_votacion_estado
    ON mesas (votacion_id, estado);

CREATE INDEX idx_resultados_votacion_candidato
    ON resultados (votacion_id, candidato_id);

CREATE INDEX idx_outbox_estado_disponible
    ON event_outbox (estado, disponible_desde);

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_registrar_resultado $$

CREATE PROCEDURE sp_registrar_resultado(
    IN p_votacion_id BIGINT UNSIGNED,
    IN p_mesa_id BIGINT UNSIGNED,
    IN p_candidato_id BIGINT UNSIGNED,
    IN p_votos INT UNSIGNED,
    IN p_usuario_id BIGINT UNSIGNED
)
BEGIN
    DECLARE v_resultado_id BIGINT UNSIGNED;

    START TRANSACTION;

    INSERT INTO resultados (
        votacion_id,
        mesa_id,
        candidato_id,
        votos,
        registrado_por
    )
    VALUES (
        p_votacion_id,
        p_mesa_id,
        p_candidato_id,
        p_votos,
        p_usuario_id
    )
    ON DUPLICATE KEY UPDATE
        votos = VALUES(votos),
        registrado_por = VALUES(registrado_por),
        actualizado_en = CURRENT_TIMESTAMP;

    SELECT id
      INTO v_resultado_id
      FROM resultados
     WHERE mesa_id = p_mesa_id
       AND candidato_id = p_candidato_id
     LIMIT 1;

    INSERT INTO event_outbox (
        aggregate_type,
        aggregate_id,
        event_type,
        payload
    )
    VALUES (
        'RESULTADO',
        CAST(v_resultado_id AS CHAR),
        'ResultadoRegistradoOActualizado',
        JSON_OBJECT(
            'resultadoId', v_resultado_id,
            'votacionId', p_votacion_id,
            'mesaId', p_mesa_id,
            'candidatoId', p_candidato_id,
            'votos', p_votos,
            'usuarioId', p_usuario_id,
            'cacheInvalidate', JSON_ARRAY(
                CONCAT('votacion:', p_votacion_id, ':resultados'),
                CONCAT('votacion:', p_votacion_id, ':resumen'),
                CONCAT('mesa:', p_mesa_id, ':resultados')
            )
        )
    );

    COMMIT;
END $$

DELIMITER ;

-- ============================================================
-- REPORTINGDB
-- ============================================================

USE ReportingDB;

CREATE TABLE IF NOT EXISTS resumen_votacion (
    votacion_id             BIGINT UNSIGNED PRIMARY KEY,
    nombre_votacion         VARCHAR(150) NOT NULL,
    estado                  VARCHAR(30) NOT NULL,
    total_mesas             INT UNSIGNED NOT NULL DEFAULT 0,
    mesas_procesadas        INT UNSIGNED NOT NULL DEFAULT 0,
    total_votos             BIGINT UNSIGNED NOT NULL DEFAULT 0,
    porcentaje_procesado    DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    ultima_actualizacion    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resultado_por_candidato (
    votacion_id             BIGINT UNSIGNED NOT NULL,
    candidato_id            BIGINT UNSIGNED NOT NULL,
    nombre_candidato        VARCHAR(150) NOT NULL,
    partido                 VARCHAR(150) NULL,
    total_votos             BIGINT UNSIGNED NOT NULL DEFAULT 0,
    porcentaje              DECIMAL(7,4) NOT NULL DEFAULT 0.0000,
    ultima_actualizacion    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (votacion_id, candidato_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resultado_por_mesa (
    votacion_id             BIGINT UNSIGNED NOT NULL,
    mesa_id                 BIGINT UNSIGNED NOT NULL,
    codigo_mesa             VARCHAR(40) NOT NULL,
    candidato_id            BIGINT UNSIGNED NOT NULL,
    nombre_candidato        VARCHAR(150) NOT NULL,
    votos                   INT UNSIGNED NOT NULL DEFAULT 0,
    ultima_actualizacion    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (mesa_id, candidato_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reporte_generado (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    votacion_id         BIGINT UNSIGNED NULL,
    tipo                ENUM('CSV','RESUMEN','ESTADISTICO') NOT NULL,
    estado              ENUM('PENDIENTE','GENERANDO','COMPLETADO','ERROR')
                        NOT NULL DEFAULT 'PENDIENTE',
    solicitado_por      BIGINT UNSIGNED NOT NULL,
    ubicacion_archivo   VARCHAR(500) NULL,
    mensaje_error       VARCHAR(1000) NULL,
    solicitado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completado_en       DATETIME NULL
) ENGINE=InnoDB;

CREATE INDEX idx_reporting_estado
    ON resumen_votacion (estado);

CREATE INDEX idx_resultado_candidato_total
    ON resultado_por_candidato (votacion_id, total_votos);

CREATE INDEX idx_reportes_estado_fecha
    ON reporte_generado (estado, solicitado_en);

-- ============================================================
-- AUDITDB
-- ============================================================

USE AuditDB;

CREATE TABLE IF NOT EXISTS eventos_auditoria (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id_origen     BIGINT UNSIGNED NULL,
    usuario_id          BIGINT UNSIGNED NULL,
    accion              VARCHAR(100) NOT NULL,
    entidad             VARCHAR(80) NOT NULL,
    entidad_id          VARCHAR(100) NULL,
    valor_anterior      JSON NULL,
    valor_nuevo         JSON NULL,
    ip_origen           VARCHAR(45) NULL,
    user_agent          VARCHAR(500) NULL,
    resultado           ENUM('EXITO','ERROR') NOT NULL DEFAULT 'EXITO',
    detalle             VARCHAR(1000) NULL,
    ocurrido_en         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_audit_event_origen UNIQUE (event_id_origen)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS accesos (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id          BIGINT UNSIGNED NULL,
    username            VARCHAR(80) NULL,
    tipo_evento         ENUM(
                            'LOGIN_OK',
                            'LOGIN_ERROR',
                            'LOGOUT',
                            'TOKEN_REVOCADO',
                            'CUENTA_BLOQUEADA'
                        ) NOT NULL,
    ip_origen           VARCHAR(45) NULL,
    user_agent          VARCHAR(500) NULL,
    detalle             VARCHAR(500) NULL,
    ocurrido_en         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_audit_usuario_fecha
    ON eventos_auditoria (usuario_id, ocurrido_en);

CREATE INDEX idx_audit_entidad
    ON eventos_auditoria (entidad, entidad_id);

CREATE INDEX idx_accesos_usuario_fecha
    ON accesos (usuario_id, ocurrido_en);

