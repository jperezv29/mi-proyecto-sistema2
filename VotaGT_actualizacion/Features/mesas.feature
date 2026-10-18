# language: es

Característica: Gestión de mesas electorales
  Como personal autorizado de VotaGT
  Quiero administrar y consultar las mesas electorales
  Para organizar correctamente el proceso de registro de resultados

  # HU-07 - Registrar mesas electorales
  Escenario: Registrar una mesa electoral correctamente
    Dado que el administrador electoral ha iniciado sesión
    Y posee permisos para gestionar mesas
    Cuando registra el número de mesa, centro de votación, municipio y departamento
    Entonces el sistema debe guardar la mesa electoral
    Y debe mostrarla en el listado de mesas

  Escenario: Registrar una mesa con datos incompletos
    Dado que el administrador electoral se encuentra registrando una mesa
    Cuando omite uno o más campos obligatorios
    Entonces el sistema debe rechazar el registro
    Y debe indicar cuáles campos son obligatorios

  Escenario: Registrar una mesa duplicada
    Dado que ya existe una mesa con el mismo número dentro del centro de votación
    Cuando el administrador intenta registrar nuevamente la misma mesa
    Entonces el sistema debe rechazar el registro
    Y debe indicar que la mesa ya existe

  # HU-08 - Consultar mesas electorales
  Escenario: Consultar mesas registradas
    Dado que el supervisor electoral ha iniciado sesión
    Y existen mesas registradas
    Cuando accede al listado de mesas electorales
    Entonces el sistema debe mostrar las mesas disponibles
    Y debe mostrar su centro, municipio, departamento y estado

  Escenario: Consultar una mesa inexistente
    Dado que el supervisor electoral ha iniciado sesión
    Cuando intenta consultar una mesa que no existe
    Entonces el sistema debe indicar que la mesa no fue encontrada
