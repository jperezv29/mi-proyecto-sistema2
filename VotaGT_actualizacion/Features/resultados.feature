# language: es

Característica: Registro y validación de resultados electorales
  Como digitador de mesa
  Quiero registrar y corregir resultados
  Para mantener información electoral válida y confiable

  # HU-11 - Registrar resultados electorales
  Escenario: Registrar un resultado correctamente
    Dado que el digitador ha iniciado sesión
    Y existe una votación activa
    Y existe una mesa registrada
    Y existe un candidato asociado a la votación
    Cuando registra una cantidad válida de votos para el candidato
    Entonces el sistema debe guardar el resultado
    Y debe asociarlo a la votación, mesa y candidato correspondientes

  Escenario: Registrar un resultado para una mesa inexistente
    Dado que el digitador ha iniciado sesión
    Cuando intenta registrar un resultado para una mesa que no existe
    Entonces el sistema debe rechazar la operación
    Y debe indicar que la mesa no fue encontrada

  # HU-12 - Validar resultados
  Escenario: Validar un resultado correcto
    Dado que el digitador ha ingresado todos los datos requeridos
    Y la cantidad de votos es igual o mayor que cero
    Y no existe un resultado previo para la misma votación, mesa y candidato
    Cuando solicita guardar el resultado
    Entonces el sistema debe aceptar los datos
    Y debe almacenar el resultado

  Escenario: Registrar una cantidad negativa de votos
    Dado que el digitador se encuentra registrando un resultado
    Cuando ingresa una cantidad de votos menor que cero
    Entonces el sistema debe rechazar el registro
    Y debe indicar que la cantidad de votos no puede ser negativa

  Escenario: Registrar un resultado duplicado
    Dado que ya existe un resultado para la misma votación, mesa y candidato
    Cuando el digitador intenta registrar nuevamente el mismo resultado
    Entonces el sistema debe rechazar la operación
    Y debe indicar que el resultado ya se encuentra registrado

  Escenario: Registrar un resultado con datos incompletos
    Dado que el digitador se encuentra registrando un resultado
    Cuando omite la votación, mesa, candidato o cantidad de votos
    Entonces el sistema debe rechazar el registro
    Y debe indicar cuáles datos son obligatorios

  # HU-13 - Corregir resultados
  Escenario: Corregir un resultado correctamente
    Dado que existe un resultado registrado
    Y el usuario autorizado posee permisos para modificarlo
    Cuando corrige la cantidad de votos con un valor válido
    Entonces el sistema debe actualizar el resultado
    Y debe conservar la información corregida

  Escenario: Intentar corregir un resultado inexistente
    Dado que el usuario autorizado ha iniciado sesión
    Cuando intenta modificar un resultado que no existe
    Entonces el sistema debe rechazar la operación
    Y debe indicar que el resultado no fue encontrado

  Escenario: Usuario sin permisos intenta corregir un resultado
    Dado que existe un resultado registrado
    Y el usuario no posee permisos para modificar resultados
    Cuando intenta editar el resultado
    Entonces el sistema debe denegar la operación
    Y debe informar que no posee permisos suficientes
