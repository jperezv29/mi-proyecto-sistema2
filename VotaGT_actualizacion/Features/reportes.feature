# language: es

Característica: Consulta y reportes de resultados
  Como usuario autorizado de VotaGT
  Quiero consultar y exportar resultados
  Para analizar el avance y los resultados del proceso electoral

  # HU-14 - Consultar resultados
  Escenario: Consultar resultados por votación
    Dado que el supervisor electoral ha iniciado sesión
    Y existen resultados registrados
    Cuando selecciona una votación para consultar sus resultados
    Entonces el sistema debe mostrar los resultados registrados
    Y debe permitir identificar la mesa y el candidato correspondiente

  Escenario: Consultar resultados de una votación inexistente
    Dado que el supervisor electoral ha iniciado sesión
    Cuando intenta consultar resultados de una votación que no existe
    Entonces el sistema debe indicar que la votación no fue encontrada

  # HU-15 - Consultar resultados consolidados
  Escenario: Consultar resultados consolidados correctamente
    Dado que existen resultados registrados para una votación
    Cuando el usuario de consulta solicita el resumen de resultados
    Entonces el sistema debe sumar los votos de cada candidato
    Y debe mostrar el total obtenido por cada candidato

  Escenario: Consultar resultados consolidados sin datos registrados
    Dado que existe una votación sin resultados registrados
    Cuando el usuario solicita los resultados consolidados
    Entonces el sistema debe mostrar que aún no existen resultados disponibles

  # HU-16 - Exportar resultados
  Escenario: Exportar resultados en formato CSV
    Dado que el usuario autorizado ha iniciado sesión
    Y existen resultados disponibles
    Cuando solicita exportar los resultados en formato CSV
    Entonces el sistema debe generar el archivo
    Y el archivo debe contener la información de los resultados consultados

  Escenario: Exportar resultados cuando no existen datos
    Dado que el usuario autorizado ha iniciado sesión
    Y no existen resultados para la votación seleccionada
    Cuando solicita exportar los resultados
    Entonces el sistema debe informar que no existen datos para exportar
