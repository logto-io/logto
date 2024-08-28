const jwt_claims = {
  title: 'JWT Personalizado',
  description:
    'Configure los reclamos personalizados del JWT para incluir en el token de acceso. Estos reclamos se pueden usar para pasar información adicional a su aplicación.',
  user_jwt: {
    card_title: 'Para usuario',
    card_field: 'Token de acceso de usuario',
    card_description:
      'Añadir datos específicos del usuario durante la emisión del token de acceso.',
    for: 'para usuario',
  },
  machine_to_machine_jwt: {
    card_title: 'Para M2M',
    card_field: 'Token de máquina a máquina',
    card_description: 'Añadir datos adicionales durante la emisión del token de máquina a máquina.',
    for: 'para M2M',
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
      'Utilice el parámetro de entrada `data.user` para proporcionar información vital del usuario.',
  },
  token_data: {
    title: 'Datos del token',
    subtitle:
      'Utilice el parámetro de entrada `token` para la carga útil actual del token de acceso. ',
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
