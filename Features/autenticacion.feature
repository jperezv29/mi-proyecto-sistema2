# language: es

Característica: Gestión de identidad y acceso
  Como usuario de VotaGT
  Quiero acceder al sistema según mi rol
  Para utilizar únicamente las funciones autorizadas

  # HU-01 - Iniciar sesión
  Escenario: Inicio de sesión exitoso
    Dado que existe un usuario activo registrado
    Y el usuario ingresa un correo y contraseña correctos
    Cuando intenta iniciar sesión
    Entonces el sistema debe permitir el acceso
    Y debe mostrar las opciones correspondientes a su rol

  Escenario: Inicio de sesión con contraseña incorrecta
    Dado que existe un usuario activo registrado
    Cuando el usuario ingresa una contraseña incorrecta
    Entonces el sistema debe rechazar el acceso
    Y debe mostrar un mensaje indicando que las credenciales son incorrectas

  Escenario: Inicio de sesión con usuario inexistente
    Dado que el correo ingresado no pertenece a ningún usuario registrado
    Cuando se intenta iniciar sesión
    Entonces el sistema debe rechazar el acceso
    Y debe indicar que el usuario no se encuentra registrado

  Escenario: Inicio de sesión con usuario inactivo
    Dado que existe un usuario registrado
    Y el usuario se encuentra inactivo
    Cuando intenta iniciar sesión
    Entonces el sistema debe rechazar el acceso
    Y debe indicar que la cuenta está deshabilitada

  # HU-02 - Gestionar usuarios
  Escenario: Crear un usuario correctamente
    Dado que el administrador ha iniciado sesión
    Y posee permisos para gestionar usuarios
    Cuando registra un usuario con nombre, correo, contraseña y rol válidos
    Entonces el sistema debe guardar el nuevo usuario
    Y debe mostrarlo en el listado de usuarios

  Escenario: Crear un usuario con correo duplicado
    Dado que ya existe un usuario con el mismo correo
    Cuando el administrador intenta registrar otro usuario con ese correo
    Entonces el sistema debe rechazar el registro
    Y debe informar que el correo ya está registrado

  Escenario: Editar un usuario correctamente
    Dado que existe un usuario registrado
    Y el administrador posee permisos para gestionarlo
    Cuando modifica los datos permitidos del usuario
    Entonces el sistema debe guardar los cambios
    Y debe mostrar la información actualizada

  Escenario: Desactivar un usuario correctamente
    Dado que existe un usuario activo
    Cuando el administrador cambia su estado a inactivo
    Entonces el sistema debe guardar el nuevo estado
    Y el usuario ya no debe poder iniciar sesión

  Escenario: Consultar un usuario inexistente
    Dado que el administrador ha iniciado sesión
    Cuando intenta consultar un usuario que no existe
    Entonces el sistema debe indicar que el usuario no fue encontrado

  # HU-03 - Asignar roles y permisos
  Escenario: Asignar un rol correctamente
    Dado que existe un usuario registrado
    Y existe el rol seleccionado
    Cuando el administrador asigna el rol al usuario
    Entonces el sistema debe guardar la asignación
    Y el usuario debe disponer de los permisos correspondientes a su rol

  Escenario: Intentar asignar un rol inexistente
    Dado que existe un usuario registrado
    Cuando el administrador intenta asignarle un rol que no existe
    Entonces el sistema debe rechazar la operación
    Y debe indicar que el rol seleccionado no es válido

  Escenario: Acceder a una función sin permisos
    Dado que un usuario ha iniciado sesión
    Y su rol no posee permisos para administrar usuarios
    Cuando intenta acceder al módulo de administración de usuarios
    Entonces el sistema debe denegar el acceso
    Y debe mostrar un mensaje de permisos insuficientes
