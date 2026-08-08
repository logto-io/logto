const jwt_claims = {
  title: 'JWT Personalizado',
  description:
    'Personalice el token de acceso o token de ID, proporcionando información adicional a su aplicación.',
  access_token: {
    card_title: 'Token de acceso',
    card_description:
      'El token de acceso es la credencial utilizada por las API para autorizar solicitudes, conteniendo solo los reclamos necesarios para las decisiones de acceso.',
  },
  user_jwt: {
    card_field: 'Token de acceso de usuario',
    card_description:
      'Añadir datos específicos del usuario durante la emisión del token de acceso.',
    for: 'para usuario',
  },
  machine_to_machine_jwt: {
    card_field: 'Token de acceso de máquina a máquina',
    card_description: 'Añadir datos adicionales durante la emisión del token de máquina a máquina.',
    for: 'para M2M',
  },
  id_token: {
    card_title: 'Token de ID',
    card_description:
      'El token de ID es una aserción de identidad recibida después del inicio de sesión, que contiene reclamos de identidad de usuario para que el cliente los use para la visualización o creación de sesión.',
    card_field: 'Token de ID de usuario',
    card_field_description:
      "Los reclamos 'sub', 'email', 'phone', 'profile' y 'address' siempre están disponibles. Los demás reclamos deben habilitarse aquí primero. En todos los casos, su aplicación debe solicitar los scopes correspondientes durante la integración para recibirlos.",
  },
  code_editor_title: 'Personalizar los reclamos de {{token}}',
  custom_jwt_create_button: 'Añadir reclamos personalizados',
  custom_jwt_item: 'Reclamos personalizados {{for}}',
  delete_modal_title: 'Eliminar reclamos personalizados',
  delete_modal_content: '¿Está seguro de que desea eliminar los reclamos personalizados?',
  clear: 'Limpiar',
  cleared: 'Limpiado',
  restore: 'Restaurar valores predeterminados',
  restored: 'Restaurado',
  data_source_tab: 'Fuente de datos',
  error_handling_tab: 'Manejo de errores',
  test_tab: 'Contexto de prueba',
  jwt_claims_description:
    'Los reclamos predeterminados se incluyen automáticamente en el JWT y no se pueden anular.',
  user_data: {
    title: 'Datos del usuario',
    subtitle:
      'Utilice el parámetro de entrada `context.user` para proporcionar información vital del usuario.',
  },
  grant_data: {
    title: 'Datos de concesión',
    subtitle:
      'Use el parámetro de entrada `context.grant` para proporcionar información vital de la concesión, solo disponible para el intercambio de tokens.',
  },
  interaction_data: {
    title: 'Contexto de interacción del usuario',
    subtitle:
      'Use el parámetro `context.interaction` para acceder a los detalles de la interacción del usuario para la sesión de autenticación actual.',
  },
  application_data: {
    title: 'Contexto de la aplicación',
    subtitle:
      'Use el parámetro de entrada `context.application` para proporcionar la información de la aplicación asociada con el token.',
  },
  organization_data: {
    title: 'Contexto de la organización',
    subtitle:
      'Use el parámetro de entrada `context.organization` para proporcionar la información de la organización objetivo, disponible solo para tokens de organización.',
  },
  token_data: {
    title: 'Datos del token',
    subtitle:
      'Utilice el parámetro de entrada `token` para la carga útil actual del token de acceso. ',
  },
  api_context: {
    title: 'Contexto de la API: control de acceso',
    subtitle: 'Utilice el método `api.denyAccess` para rechazar la solicitud de token.',
  },
  cryptographic_capability: {
    title: 'Contexto de API: criptografía',
    subtitle: 'Usa `api.crypto.sha256` y `api.crypto.hmacSha256` para el hash UTF-8.',
    description:
      'Ambos métodos son asíncronos y devuelven una Promise con una cadena hexadecimal en minúsculas de 64 caracteres. Las entradas se codifican como UTF-8 sin normalización Unicode: `sha256(input)` calcula SHA-256(UTF-8(input)); `hmacSha256({ key, input })` calcula HMAC-SHA-256(UTF-8(key), UTF-8(input)). Lee las claves HMAC de las variables de entorno, llama tú mismo a `.trim()` y rechaza un resultado vacío antes de invocar HMAC: el método nunca recorta ni recurre a SHA-256. Prefiere una clave de alta entropía sin espacios. La entrada de mensaje vacía es válida; una clave vacía no. La entrada está limitada a 1 MiB de bytes UTF-8 y una clave HMAC a 64 KiB. SHA-256 no oculta identificadores enumerables como correos o teléfonos; usa HMAC para un identificador estable con clave secreta. Ningún método sirve para almacenar contraseñas. Las variables de entorno son visibles para administradores de Custom JWT autorizados y el runtime de ejecución, y no son un sistema de claves gestionado. Rotar una clave HMAC cambia cada valor derivado: los scripts que necesiten migración deben llevar una versión de clave definida por la aplicación e implementar cualquier periodo de doble valor. Varios valores necesitan una serialización inequívoca definida por el llamador (p. ej. `JSON.stringify([value1, value2])` en el mismo runtime); las integraciones entre lenguajes deben acordar su propia forma canónica. En Logto autoalojado, este script mantiene el modelo de script de confianza descrito en la advertencia de sandbox.',
  },
  error_handling: {
    title: 'Manejo de errores',
    subtitle: 'Controla si la emisión del token debe bloquearse cuando el script falla.',
    input_field_title: 'Comportamiento de emisión del token cuando el script falla',
    block_issuance_switch: 'Bloquear la emisión del token cuando el script produce errores',
    default_hint_create:
      'Los scripts nuevos de claims personalizados bloquean por defecto la emisión del token cuando el script falla. Si la API ya devuelve un valor, se usará ese valor guardado.',
    default_hint_edit:
      'Los scripts existentes de claims personalizados sin esta configuración mantienen el comportamiento heredado con esta opción desactivada hasta que guardes un valor explícitamente.',
    warning:
      'Cuando está habilitado, los errores de ejecución del script rechazan la solicitud de token con `invalid_request` (400) y un `error_description` localizado. Las llamadas a `api.denyAccess` siguen devolviendo `access_denied`.',
  },
  fetch_external_data: {
    title: 'Obtener datos externos',
    subtitle: 'Incorpore datos de sus API externas directamente en los reclamos.',
    description:
      'Utilice la función `fetch` para llamar a sus API externas e incluir los datos en sus reclamos personalizados. Ejemplo: ',
  },
  environment_variables: {
    title: 'Establecer variables de entorno',
    subtitle: 'Utilice variables de entorno para almacenar información confidencial.',
    input_field_title: 'Añadir variables de entorno',
    sample_code:
      'Acceso a variables de entorno en el gestor de reclamos JWT personalizados. Ejemplo: ',
  },
  jwt_claims_hint:
    'Limite los reclamos personalizados a menos de 50 KB. Los reclamos predeterminados del JWT se incluyen automáticamente en el token y no se pueden anular.',
  tester: {
    subtitle: 'Ajustar el token simulado y los datos de usuario para pruebas.',
    run_button: 'Ejecutar prueba',
    result_title: 'Resultado de prueba',
  },
  sandbox_warning: {
    title: 'Los scripts se ejecutan con privilegios del servidor',
    description:
      'En Logto autoalojado, este script se ejecuta en el mismo entorno que Logto: puede leer variables de entorno del servidor y alcanzar servicios de tu red interna. No está aislado en un sandbox. Concede acceso a esta página solo a personas a las que confiarías el acceso al servidor.',
  },
  form_error: {
    invalid_json: 'Formato JSON no válido',
  },
};

export default Object.freeze(jwt_claims);
