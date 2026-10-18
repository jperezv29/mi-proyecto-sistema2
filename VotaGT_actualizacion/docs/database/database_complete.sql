--
-- PostgreSQL database dump
--

\restrict ebzmgiZmNRf1VMtdnsepmysaHfdlgicgbNs1kTDvOabTHhGqvNrkaec8SP5wuFC

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: election; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA election;


--
-- Name: estado_usuario; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.estado_usuario AS ENUM (
    'ACTIVO',
    'BLOQUEADO',
    'INACTIVO'
);


--
-- Name: estado_candidato; Type: TYPE; Schema: election; Owner: -
--

CREATE TYPE election.estado_candidato AS ENUM (
    'ACTIVO',
    'INACTIVO',
    'RETIRADO'
);


--
-- Name: estado_mesa; Type: TYPE; Schema: election; Owner: -
--

CREATE TYPE election.estado_mesa AS ENUM (
    'ACTIVA',
    'INACTIVA',
    'CERRADA'
);


--
-- Name: estado_votacion; Type: TYPE; Schema: election; Owner: -
--

CREATE TYPE election.estado_votacion AS ENUM (
    'PROGRAMADA',
    'ABIERTA',
    'CERRADA',
    'CANCELADA'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: permisos; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.permisos (
    id bigint NOT NULL,
    codigo character varying(100) NOT NULL,
    descripcion character varying(255),
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: permisos_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

ALTER TABLE auth.permisos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.permisos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: recuperacion_password; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.recuperacion_password (
    id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    token_hash character varying(255) NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expira_en timestamp without time zone NOT NULL,
    utilizado_en timestamp without time zone
);


--
-- Name: recuperacion_password_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

ALTER TABLE auth.recuperacion_password ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.recuperacion_password_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rol_permiso; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.rol_permiso (
    rol_id bigint NOT NULL,
    permiso_id bigint NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.roles (
    id bigint NOT NULL,
    nombre character varying(60) NOT NULL,
    descripcion character varying(255),
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

ALTER TABLE auth.roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sesiones; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sesiones (
    id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    refresh_token_hash character varying(255) NOT NULL,
    ip character varying(45),
    user_agent character varying(500),
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expira_en timestamp without time zone NOT NULL,
    revocado_en timestamp without time zone
);


--
-- Name: sesiones_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

ALTER TABLE auth.sesiones ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.sesiones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuario_rol; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.usuario_rol (
    usuario_id bigint NOT NULL,
    rol_id bigint NOT NULL,
    asignado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: usuarios; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.usuarios (
    id bigint NOT NULL,
    username character varying(80) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    nombres character varying(120) NOT NULL,
    apellidos character varying(120) NOT NULL,
    estado auth.estado_usuario DEFAULT 'ACTIVO'::auth.estado_usuario NOT NULL,
    intentos_fallidos integer DEFAULT 0 NOT NULL,
    bloqueado_hasta timestamp without time zone,
    ultimo_login timestamp without time zone,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT usuarios_intentos_fallidos_check CHECK ((intentos_fallidos >= 0))
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

ALTER TABLE auth.usuarios ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: candidatos; Type: TABLE; Schema: election; Owner: -
--

CREATE TABLE election.candidatos (
    id bigint NOT NULL,
    votacion_id bigint NOT NULL,
    nombre character varying(150) NOT NULL,
    partido character varying(150),
    cargo character varying(120) NOT NULL,
    numero_lista integer,
    estado election.estado_candidato DEFAULT 'ACTIVO'::election.estado_candidato NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_numero_lista CHECK (((numero_lista IS NULL) OR (numero_lista > 0)))
);


--
-- Name: candidatos_id_seq; Type: SEQUENCE; Schema: election; Owner: -
--

ALTER TABLE election.candidatos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME election.candidatos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mesas; Type: TABLE; Schema: election; Owner: -
--

CREATE TABLE election.mesas (
    id bigint NOT NULL,
    votacion_id bigint NOT NULL,
    codigo character varying(30) NOT NULL,
    nombre character varying(120) NOT NULL,
    ubicacion character varying(200),
    departamento character varying(100),
    municipio character varying(100),
    estado election.estado_mesa DEFAULT 'ACTIVA'::election.estado_mesa NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: mesas_id_seq; Type: SEQUENCE; Schema: election; Owner: -
--

ALTER TABLE election.mesas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME election.mesas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: resultados; Type: TABLE; Schema: election; Owner: -
--

CREATE TABLE election.resultados (
    id bigint NOT NULL,
    votacion_id bigint NOT NULL,
    mesa_id bigint NOT NULL,
    candidato_id bigint NOT NULL,
    votos integer NOT NULL,
    registrado_por bigint NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT resultados_votos_check CHECK ((votos >= 0))
);


--
-- Name: resultados_id_seq; Type: SEQUENCE; Schema: election; Owner: -
--

ALTER TABLE election.resultados ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME election.resultados_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: votaciones; Type: TABLE; Schema: election; Owner: -
--

CREATE TABLE election.votaciones (
    id bigint NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion character varying(500),
    fecha_inicio timestamp without time zone NOT NULL,
    fecha_fin timestamp without time zone NOT NULL,
    estado election.estado_votacion DEFAULT 'PROGRAMADA'::election.estado_votacion NOT NULL,
    creado_por bigint NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_votacion_fechas CHECK ((fecha_fin > fecha_inicio))
);


--
-- Name: votaciones_id_seq; Type: SEQUENCE; Schema: election; Owner: -
--

ALTER TABLE election.votaciones ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME election.votaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: permisos permisos_codigo_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.permisos
    ADD CONSTRAINT permisos_codigo_key UNIQUE (codigo);


--
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (id);


--
-- Name: recuperacion_password recuperacion_password_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.recuperacion_password
    ADD CONSTRAINT recuperacion_password_pkey PRIMARY KEY (id);


--
-- Name: recuperacion_password recuperacion_password_token_hash_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.recuperacion_password
    ADD CONSTRAINT recuperacion_password_token_hash_key UNIQUE (token_hash);


--
-- Name: rol_permiso rol_permiso_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.rol_permiso
    ADD CONSTRAINT rol_permiso_pkey PRIMARY KEY (rol_id, permiso_id);


--
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sesiones sesiones_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sesiones
    ADD CONSTRAINT sesiones_pkey PRIMARY KEY (id);


--
-- Name: usuario_rol usuario_rol_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.usuario_rol
    ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (usuario_id, rol_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- Name: candidatos candidatos_pkey; Type: CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.candidatos
    ADD CONSTRAINT candidatos_pkey PRIMARY KEY (id);


--
-- Name: mesas mesas_pkey; Type: CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.mesas
    ADD CONSTRAINT mesas_pkey PRIMARY KEY (id);


--
-- Name: resultados resultados_pkey; Type: CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.resultados
    ADD CONSTRAINT resultados_pkey PRIMARY KEY (id);


--
-- Name: candidatos uq_candidato_id_votacion; Type: CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.candidatos
    ADD CONSTRAINT uq_candidato_id_votacion UNIQUE (id, votacion_id);


--
-- Name: candidatos uq_candidato_lista; Type: CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.candidatos
    ADD CONSTRAINT uq_candidato_lista UNIQUE (votacion_id, numero_lista);


--
-- Name: mesas uq_mesa_codigo; Type: CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.mesas
    ADD CONSTRAINT uq_mesa_codigo UNIQUE (votacion_id, codigo);


--
-- Name: mesas uq_mesa_id_votacion; Type: CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.mesas
    ADD CONSTRAINT uq_mesa_id_votacion UNIQUE (id, votacion_id);


--
-- Name: resultados uq_resultado_mesa_candidato; Type: CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.resultados
    ADD CONSTRAINT uq_resultado_mesa_candidato UNIQUE (mesa_id, candidato_id);


--
-- Name: votaciones votaciones_pkey; Type: CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.votaciones
    ADD CONSTRAINT votaciones_pkey PRIMARY KEY (id);


--
-- Name: idx_sesiones_usuario; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_sesiones_usuario ON auth.sesiones USING btree (usuario_id);


--
-- Name: idx_usuarios_estado; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_usuarios_estado ON auth.usuarios USING btree (estado);


--
-- Name: idx_resultados_candidato; Type: INDEX; Schema: election; Owner: -
--

CREATE INDEX idx_resultados_candidato ON election.resultados USING btree (candidato_id);


--
-- Name: idx_resultados_mesa; Type: INDEX; Schema: election; Owner: -
--

CREATE INDEX idx_resultados_mesa ON election.resultados USING btree (mesa_id);


--
-- Name: idx_resultados_votacion; Type: INDEX; Schema: election; Owner: -
--

CREATE INDEX idx_resultados_votacion ON election.resultados USING btree (votacion_id);


--
-- Name: idx_votaciones_estado_fecha; Type: INDEX; Schema: election; Owner: -
--

CREATE INDEX idx_votaciones_estado_fecha ON election.votaciones USING btree (estado, fecha_inicio, fecha_fin);


--
-- Name: recuperacion_password fk_recuperacion_usuario; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.recuperacion_password
    ADD CONSTRAINT fk_recuperacion_usuario FOREIGN KEY (usuario_id) REFERENCES auth.usuarios(id) ON DELETE CASCADE;


--
-- Name: rol_permiso fk_rol_permiso_permiso; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.rol_permiso
    ADD CONSTRAINT fk_rol_permiso_permiso FOREIGN KEY (permiso_id) REFERENCES auth.permisos(id) ON DELETE CASCADE;


--
-- Name: rol_permiso fk_rol_permiso_rol; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.rol_permiso
    ADD CONSTRAINT fk_rol_permiso_rol FOREIGN KEY (rol_id) REFERENCES auth.roles(id) ON DELETE CASCADE;


--
-- Name: sesiones fk_sesion_usuario; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sesiones
    ADD CONSTRAINT fk_sesion_usuario FOREIGN KEY (usuario_id) REFERENCES auth.usuarios(id) ON DELETE CASCADE;


--
-- Name: usuario_rol fk_usuario_rol_rol; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.usuario_rol
    ADD CONSTRAINT fk_usuario_rol_rol FOREIGN KEY (rol_id) REFERENCES auth.roles(id) ON DELETE CASCADE;


--
-- Name: usuario_rol fk_usuario_rol_usuario; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.usuario_rol
    ADD CONSTRAINT fk_usuario_rol_usuario FOREIGN KEY (usuario_id) REFERENCES auth.usuarios(id) ON DELETE CASCADE;


--
-- Name: candidatos fk_candidato_votacion; Type: FK CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.candidatos
    ADD CONSTRAINT fk_candidato_votacion FOREIGN KEY (votacion_id) REFERENCES election.votaciones(id) ON DELETE CASCADE;


--
-- Name: mesas fk_mesa_votacion; Type: FK CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.mesas
    ADD CONSTRAINT fk_mesa_votacion FOREIGN KEY (votacion_id) REFERENCES election.votaciones(id) ON DELETE CASCADE;


--
-- Name: resultados fk_resultado_candidato_votacion; Type: FK CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.resultados
    ADD CONSTRAINT fk_resultado_candidato_votacion FOREIGN KEY (candidato_id, votacion_id) REFERENCES election.candidatos(id, votacion_id) ON DELETE CASCADE;


--
-- Name: resultados fk_resultado_mesa_votacion; Type: FK CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.resultados
    ADD CONSTRAINT fk_resultado_mesa_votacion FOREIGN KEY (mesa_id, votacion_id) REFERENCES election.mesas(id, votacion_id) ON DELETE CASCADE;


--
-- Name: resultados fk_resultado_usuario; Type: FK CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.resultados
    ADD CONSTRAINT fk_resultado_usuario FOREIGN KEY (registrado_por) REFERENCES auth.usuarios(id) ON DELETE RESTRICT;


--
-- Name: resultados fk_resultado_votacion; Type: FK CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.resultados
    ADD CONSTRAINT fk_resultado_votacion FOREIGN KEY (votacion_id) REFERENCES election.votaciones(id) ON DELETE CASCADE;


--
-- Name: votaciones fk_votacion_usuario; Type: FK CONSTRAINT; Schema: election; Owner: -
--

ALTER TABLE ONLY election.votaciones
    ADD CONSTRAINT fk_votacion_usuario FOREIGN KEY (creado_por) REFERENCES auth.usuarios(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict ebzmgiZmNRf1VMtdnsepmysaHfdlgicgbNs1kTDvOabTHhGqvNrkaec8SP5wuFC

--
-- PostgreSQL database dump
--

\restrict dN1JIqOsnRdS0iahlEBim2CPgInOsweXYxs2iYDfgz7jNLS04YwbTRlzcxuwGr1

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: permisos; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.permisos (id, codigo, descripcion, creado_en) FROM stdin;
1	USUARIOS_GESTIONAR	Gestionar usuarios, roles y permisos	2026-10-12 16:51:38.416471
2	VOTACIONES_GESTIONAR	Crear y modificar procesos electorales	2026-10-12 16:51:38.416471
3	CANDIDATOS_GESTIONAR	Crear y modificar candidatos	2026-10-12 16:51:38.416471
4	MESAS_GESTIONAR	Crear y modificar mesas electorales	2026-10-12 16:51:38.416471
5	RESULTADOS_REGISTRAR	Registrar resultados electorales	2026-10-12 16:51:38.416471
6	RESULTADOS_CONSULTAR	Consultar resultados electorales	2026-10-12 16:51:38.416471
7	REPORTES_GENERAR	Generar reportes y exportaciones	2026-10-12 16:51:38.416471
8	AUDITORIA_CONSULTAR	Consultar trazabilidad y auditor¡a	2026-10-12 16:51:38.416471
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.roles (id, nombre, descripcion, creado_en) FROM stdin;
1	ADMINISTRADOR	Administraci¢n general del sistema electoral	2026-10-12 16:50:33.538827
2	DIGITADOR	Registro y actualizaci¢n autorizada de resultados	2026-10-12 16:50:33.538827
3	SUPERVISOR	Consulta de avances, resultados e inconsistencias	2026-10-12 16:50:33.538827
4	CONSULTA	Consulta de informaci¢n electoral publicada	2026-10-12 16:50:33.538827
\.


--
-- Data for Name: rol_permiso; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.rol_permiso (rol_id, permiso_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
2	5
2	6
3	6
3	7
3	8
4	6
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.usuarios (id, username, email, password_hash, nombres, apellidos, estado, intentos_fallidos, bloqueado_hasta, ultimo_login, creado_en, actualizado_en) FROM stdin;
1	admin	admin@votagt.local	$2b$12$YIOaCCOuQqZmxGgDEy5RCOfbav9sfBuzPKt2NuLVvwEhyko/EEApW	Administrador	VotaGT	ACTIVO	0	\N	2026-10-12 22:19:51.135221	2026-10-12 17:41:10.388321	2026-10-12 22:19:51.135221
\.


--
-- Data for Name: usuario_rol; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.usuario_rol (usuario_id, rol_id, asignado_en) FROM stdin;
1	1	2026-10-12 17:41:10.388321
\.


--
-- Name: permisos_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.permisos_id_seq', 8, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.roles_id_seq', 4, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.usuarios_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict dN1JIqOsnRdS0iahlEBim2CPgInOsweXYxs2iYDfgz7jNLS04YwbTRlzcxuwGr1

