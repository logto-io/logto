const single_sign_on = {
  forbidden_domains: 'Los dominios de correo electrónico público no están permitidos.',
  duplicated_domains: 'Hay dominios duplicados.',
  invalid_domain_format: 'Formato de dominio no válido.',
  duplicate_connector_name:
    'El nombre del conector ya existe. Por favor elige un nombre diferente.',
  idp_initiated_authentication_not_supported:
    'La autenticación iniciada por IdP es compatible exclusivamente con conectores SAML.',
  idp_initiated_authentication_invalid_application_type:
    'Tipo de aplicación no válido. Solo se permiten aplicaciones {{type}}.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'El redirect_uri no está registrado. Por favor verifica la configuración de la aplicación.',
  idp_initiated_authentication_client_callback_uri_not_found:
    'No se encuentra el URI de callback de autenticación iniciada por IdP del cliente. Por favor verifica la configuración del conector.',
};

export default Object.freeze(single_sign_on);
