# language: es

Característica: Gestión de candidatos
  Como personal autorizado de VotaGT
  Quiero registrar y consultar candidatos
  Para asociarlos correctamente a cada proceso electoral

  # HU-09 - Registrar candidatos
  Escenario: Registrar un candidato correctamente
    Dado que el administrador electoral ha iniciado sesión
    Y existe una votación registrada
    Cuando registra el nombre, partido, cargo y votación del candidato
    Entonces el sistema debe guardar el candidato
    Y debe asociarlo a la votación seleccionada

  Escenario: Registrar un candidato con datos incompletos
    Dado que el administrador electoral se encuentra registrando un candidato
    Cuando omite uno o más campos obligatorios
    Entonces el sistema debe rechazar el registro
    Y debe indicar cuáles campos son obligatorios

  Escenario: Registrar un candidato en una votación inexistente
    Dado que el administrador electoral ha iniciado sesión
    Cuando intenta registrar un candidato en una votación que no existe
    Entonces el sistema debe rechazar la operación
    Y debe indicar que la votación seleccionada no fue encontrada

  # HU-10 - Consultar candidatos
  Escenario: Consultar candidatos de una votación
    Dado que el usuario autorizado ha iniciado sesión
    Y existen candidatos asociados a una votación
    Cuando consulta los candidatos de esa votación
    Entonces el sistema debe mostrar los candidatos registrados
    Y debe mostrar su nombre, partido y cargo

  Escenario: Consultar candidatos de una votación sin registros
    Dado que existe una votación sin candidatos registrados
    Cuando el usuario autorizado consulta sus candidatos
    Entonces el sistema debe mostrar un listado vacío
    Y debe informar que no existen candidatos registrados para esa votación
