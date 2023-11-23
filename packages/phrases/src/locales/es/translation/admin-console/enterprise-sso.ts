const enterprise_sso = {
  page_title: 'SSO de la empresa',
  title: 'SSO de la empresa',
  subtitle:
    'Conecta el proveedor de identidad de la empresa y habilita el inicio de sesión único iniciado por el proveedor de servicios.',
  create: 'Agregar conector de la empresa',
  col_connector_name: 'Nombre del conector',
  col_type: 'Tipo',
  col_email_domain: 'Dominio de correo electrónico',
  col_status: 'Estado',
  col_status_in_use: 'En uso',
  col_status_invalid: 'Inválido',
  placeholder_title: 'Conector de la empresa',
  placeholder_description:
    'Logto ha proporcionado muchos proveedores de identidad empresariales integrados para conectarse, al mismo tiempo, puedes crear el tuyo propio con protocolos estándar.',
  create_modal: {
    title: 'Agregar conector de la empresa',
    text_divider: 'O puedes personalizar tu conector con un protocolo estándar.',
    connector_name_field_title: 'Nombre del conector',
    connector_name_field_placeholder: 'Nombre para el proveedor de identidad empresarial',
    create_button_text: 'Crear conector',
  },
  guide: {
    subtitle: 'Una guía paso a paso para conectar el proveedor de identidad empresarial.',
    finish_button_text: 'Continuar',
  },
  basic_info: {
    title: 'Configura tu servicio en el IdP',
    description:
      'Crea una nueva integración de aplicación mediante SAML 2.0 en tu proveedor de identidad {{name}}. Luego pega el siguiente valor en ello.',
    saml: {
      acs_url_field_name: 'URL del servicio de consumidor de afirmaciones (URL de respuesta)',
      audience_uri_field_name: 'URI de audiencia (ID de entidad SP)',
    },
    oidc: {
      redirect_uri_field_name: 'URI de redirección (URL de devolución de llamada)',
    },
  },
  attribute_mapping: {
    title: 'Mapeo de atributos',
    description:
      '`id` y `email` son necesarios para sincronizar el perfil del usuario desde IdP. Ingresa el siguiente nombre de reclamo y valor en tu IdP.',
    col_sp_claims: 'Nombre de reclamo de Logto',
    col_idp_claims: 'Nombre de reclamo del proveedor de identidad',
    idp_claim_tooltip: 'El nombre de reclamo del proveedor de identidad',
  },
  metadata: {
    title: 'Configura los metadatos del IdP',
    description: 'Configura los metadatos del proveedor de identidad',
    dropdown_trigger_text: 'Usar otro método de configuración',
    dropdown_title: 'seleccionar tu método de configuración',
    metadata_format_url: 'Introduce la URL de los metadatos',
    metadata_format_xml: 'Sube el archivo XML de los metadatos',
    metadata_format_manual: 'Introduce los detalles de los metadatos manualmente',
    saml: {
      metadata_url_field_name: 'URL de los metadatos',
      metadata_url_description:
        'Obtener dinámicamente los datos desde la URL de metadatos y mantener actualizado el certificado.',
      metadata_xml_field_name: 'Archivo XML de los metadatos',
      metadata_xml_uploader_text: 'Subir archivo XML de los metadatos',
      sign_in_endpoint_field_name: 'URL de inicio de sesión',
      idp_entity_id_field_name: 'ID del proveedor de identidad (Emisor)',
      certificate_field_name: 'Certificado de firma',
      certificate_placeholder: 'Copia y pega el certificado x509',
    },
    oidc: {
      client_id_field_name: 'ID de cliente',
      client_secret_field_name: 'Secreto de cliente',
      issuer_field_name: 'Emisor',
      scope_field_name: 'Ámbito',
    },
  },
};

export default Object.freeze(enterprise_sso);
