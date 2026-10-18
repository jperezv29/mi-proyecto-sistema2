# language: es

Característica: Auditoría y trazabilidad
  Como administrador de VotaGT
  Quiero registrar y consultar las acciones importantes del sistema
  Para mantener trazabilidad sobre los cambios realizados

  # HU-17 - Registrar auditoría
  Escenario: Registrar automáticamente una modificación
    Dado que un usuario autorizado ha iniciado sesión
    Y existe un registro susceptible de auditoría
    Cuando el usuario modifica información importante
    Entonces el sistema debe guardar la modificación
    Y debe registrar en la bitácora el usuario, acción, fecha y registro afectado

  Escenario: Error al registrar una operación auditada
    Dado que un usuario autorizado intenta modificar información
    Cuando ocurre un error y la modificación no se completa
    Entonces el sistema no debe registrar la operación como exitosa
    Y debe conservar información del error para su revisión

  # HU-18 - Consultar auditoría
  Escenario: Consultar la bitácora de auditoría
    Dado que el administrador ha iniciado sesión
    Y existen eventos registrados en la bitácora
    Cuando accede al módulo de auditoría
    Entonces el sistema debe mostrar los eventos registrados
    Y debe permitir identificar usuario, acción y fecha

  Escenario: Usuario sin permisos intenta consultar la auditoría
    Dado que un usuario ha iniciado sesión
    Y no posee permisos de administrador
    Cuando intenta acceder a la bitácora de auditoría
    Entonces el sistema debe denegar el acceso
    Y debe informar que no posee permisos suficientes
