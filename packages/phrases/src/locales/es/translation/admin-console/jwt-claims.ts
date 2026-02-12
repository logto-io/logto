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
  token_data: {
    title: 'Datos del token',
    subtitle:
      'Utilice el parámetro de entrada `token` para la carga útil actual del token de acceso. ',
  },
  api_context: {
    title: 'Contexto de la API: control de acceso',
    subtitle: 'Utilice el método `api.denyAccess` para rechazar la solicitud de token.',
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
  form_error: {
    invalid_json: 'Formato JSON no válido',
  },
};

export default Object.freeze(jwt_claims);
