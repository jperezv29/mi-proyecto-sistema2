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

