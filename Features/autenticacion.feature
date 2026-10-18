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

# language: es

Característica: Autenticación de usuarios
  Como usuario registrado del sistema VotaGT
  Quiero autenticarme mediante mis credenciales
  Para acceder únicamente a las funciones autorizadas según mis roles y permisos

  Antecedentes:
    Dado que la API VotaGT está disponible
    Y existen usuarios registrados en el sistema

  Escenario: Inicio de sesión exitoso
    Dado que existe un usuario activo con credenciales válidas
    Cuando el usuario envía una solicitud POST a "/api/v1/auth/login"
    Y proporciona un identificador y contraseña correctos
    Entonces el sistema debe responder con estado HTTP 200
    Y debe devolver un token JWT
    Y el token debe contener los roles y permisos del usuario

  Escenario: Consultar perfil con token válido
    Dado que el usuario inició sesión correctamente
    Y posee un token JWT válido
    Cuando envía una solicitud GET a "/api/v1/auth/perfil"
    Entonces el sistema debe responder con estado HTTP 200
    Y debe devolver la información del usuario autenticado

  Escenario: Intentar consultar el perfil sin token
    Dado que el usuario no proporciona un token JWT
    Cuando envía una solicitud GET a "/api/v1/auth/perfil"
    Entonces el sistema debe responder con estado HTTP 401
    Y la respuesta debe utilizar el formato "application/problem+json"
    Y debe indicar que se requiere autenticación

  Esquema del escenario: Validar datos incorrectos durante el inicio de sesión
    Dado que el usuario desea iniciar sesión
    Cuando envía el identificador "<identificador>"
    Y envía la contraseña "<password>"
    Entonces el sistema debe responder con estado HTTP <estado>
    Y debe devolver el tipo de problema "<tipo>"

    Ejemplos:
      | identificador        | password          | estado | tipo                |
      |                      | Admin123*         | 400    | invalid-request     |
      | admin                |                   | 400    | invalid-request     |
      | usuario_inexistente  | ClaveIncorrecta1* | 401    | invalid-credentials |

  Escenario: Bloqueo temporal después de múltiples intentos fallidos
    Dado que existe un usuario activo
    Y el usuario ha realizado varios intentos consecutivos con contraseña incorrecta
    Cuando alcanza el límite permitido de intentos fallidos
    Entonces el sistema debe responder con estado HTTP 403
    Y la cuenta debe quedar temporalmente bloqueada