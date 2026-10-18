# language: es

Característica: Gestión de votaciones
  Como administrador electoral
  Quiero administrar las votaciones
  Para controlar los procesos electorales registrados en VotaGT

  # HU-04 - Crear una votación
  Escenario: Crear una votación correctamente
    Dado que el administrador electoral ha iniciado sesión
    Y posee permisos para gestionar votaciones
    Cuando registra una votación con nombre, descripción y fechas válidas
    Entonces el sistema debe guardar la votación
    Y debe mostrarla en el listado de votaciones

  Escenario: Crear una votación con datos incompletos
    Dado que el administrador electoral se encuentra creando una votación
    Cuando omite uno o más campos obligatorios
    Entonces el sistema debe rechazar el registro
    Y debe indicar cuáles campos son obligatorios

  Escenario: Crear una votación con fechas inválidas
    Dado que el administrador electoral se encuentra creando una votación
    Cuando ingresa una fecha de finalización anterior a la fecha de inicio
    Entonces el sistema debe rechazar el registro
    Y debe indicar que el rango de fechas no es válido

  # HU-05 - Modificar una votación
  Escenario: Modificar una votación correctamente
    Dado que existe una votación registrada
    Y el administrador electoral posee permisos para modificarla
    Cuando actualiza la descripción, fechas o estado de la votación con datos válidos
    Entonces el sistema debe guardar los cambios
    Y debe mostrar la información actualizada

  Escenario: Modificar una votación inexistente
    Dado que el administrador electoral ha iniciado sesión
    Cuando intenta modificar una votación que no existe
    Entonces el sistema debe rechazar la operación
    Y debe indicar que la votación no fue encontrada

  # HU-06 - Consultar votaciones
  Escenario: Consultar votaciones registradas
    Dado que el usuario autorizado ha iniciado sesión
    Y existen votaciones registradas
    Cuando accede al listado de votaciones
    Entonces el sistema debe mostrar las votaciones disponibles
    Y debe indicar el estado de cada votación

  Escenario: Consultar votaciones cuando no existen registros
    Dado que el usuario autorizado ha iniciado sesión
    Y no existen votaciones registradas
    Cuando accede al listado de votaciones
    Entonces el sistema debe mostrar un listado vacío
    Y debe informar que no existen votaciones registradas
