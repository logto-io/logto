const enterprise_sso = {
  page_title: 'SSO de la empresa',
  title: 'SSO de la empresa',
  subtitle: 'Conecta el proveedor de identidad de la empresa y habilita el inicio de sesión único.',
  create: 'Agregar conector de la empresa',
  col_connector_name: 'Nombre del conector',
  col_type: 'Tipo',
  col_email_domain: 'Dominio de correo electrónico',
  placeholder_title: 'Conector de la empresa',
  placeholder_description:
    'Logto ha proporcionado muchos proveedores de identidad empresariales integrados para conectarse, al mismo tiempo, puedes crear uno propio con los protocolos SAML y OIDC.',
  create_modal: {
    title: 'Agregar conector de la empresa',
    text_divider: 'O puedes personalizar tu conector con un protocolo estándar.',
    connector_name_field_title: 'Nombre del conector',
    connector_name_field_placeholder:
      'Por ejemplo, {corp. name} - {nombre del proveedor de identidad}',
    create_button_text: 'Crear conector',
  },
  guide: {
    subtitle: 'Una guía paso a paso para conectar el proveedor de identidad de la empresa.',
    finish_button_text: 'Continuar',
  },
  basic_info: {
    title: 'Configura tu servicio en el IdP',
    description:
      'Crea una nueva integración de aplicación mediante SAML 2.0 en tu proveedor de identidad {{name}}. Luego pega el siguiente valor en él.',
    saml: {
      acs_url_field_name: 'URL de servicio de consumidor de aserciones (URL de respuesta)',
      audience_uri_field_name: 'URI del público objetivo (ID de entidad del SP)',
      entity_id_field_name: 'ID de entidad del proveedor de servicios (SP)',
      entity_id_field_tooltip:
        'El ID de entidad del SP puede estar en cualquier formato de cadena, generalmente utilizando un formato de URI o un formato de URL como identificador, pero no es obligatorio.',
      acs_url_field_placeholder: 'https://tu-dominio.com/api/saml/callback',
      entity_id_field_placeholder: 'urn:tu-dominio.com:sp:saml:{serviceProviderId}',
    },
    oidc: {
      redirect_uri_field_name: 'URI de redireccionamiento (URL de devolución de llamada)',
      redirect_uri_field_description:
        'La URI de redirección es donde se redirige a los usuarios tras la autenticación SSO. Añade esta URI a la configuración de tu IdP.',
      redirect_uri_field_custom_domain_description:
        'Si usas varios <a>dominios personalizados</a> en Logto, asegúrate de añadir todas las URI de callback correspondientes a tu IdP para que el SSO funcione en cada dominio.\n\nEl dominio predeterminado de Logto (*.logto.app) siempre es válido; inclúyelo solo si también deseas admitir SSO bajo ese dominio.',
    },
  },
  attribute_mapping: {
    title: 'Mapeo de atributos',
    description:
      'Los campos `id` y `email` son necesarios para sincronizar el perfil del usuario desde el IdP. Ingresa el siguiente nombre de reclamación y valor en tu IdP.',
    col_sp_claims: 'Valor del proveedor de servicios (Logto)',
    col_idp_claims: 'Nombre de la reclamación del proveedor de identidad',
    idp_claim_tooltip: 'El nombre de la reclamación del proveedor de identidad',
  },
  metadata: {
    title: 'Configurar los metadatos del IdP',
    description: 'Configura los metadatos del proveedor de identidad',
    dropdown_trigger_text: 'Usar otro método de configuración',
    dropdown_title: 'selecciona tu método de configuración',
    metadata_format_url: 'Ingresa la URL de los metadatos',
    metadata_format_xml: 'Sube el archivo XML de los metadatos',
    metadata_format_manual: 'Ingresa los detalles de los metadatos manualmente',
    saml: {
      metadata_url_field_name: 'URL de metadatos',
      metadata_url_description:
        'Obtén dinámicamente los datos desde la URL de los metadatos y mantén el certificado actualizado.',
      metadata_xml_field_name: 'Archivo XML de los metadatos del IdP',
      metadata_xml_uploader_text: 'Subir archivo XML de los metadatos',
      sign_in_endpoint_field_name: 'URL de inicio de sesión',
      idp_entity_id_field_name: 'ID del proveedor de identidad (Emisor)',
      certificate_field_name: 'Certificado de firma',
      certificate_placeholder: 'Copia y pega el certificado x509',
      certificate_required: 'Se requiere un certificado de firma.',
    },
    oidc: {
      client_id_field_name: 'ID de cliente',
      client_secret_field_name: 'Secreto de cliente',
      issuer_field_name: 'Emisor',
      scope_field_name: 'Ámbito',
      scope_field_placeholder: 'Ingrese los ámbitos (separados por un espacio)',
    },
  },
};

export default Object.freeze(enterprise_sso);
