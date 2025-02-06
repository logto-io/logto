const single_sign_on = {
  forbidden_domains: 'Domínios de e-mail público não são permitidos.',
  duplicated_domains: 'Existem domínios duplicados.',
  invalid_domain_format: 'Formato de domínio inválido.',
  duplicate_connector_name: 'O nome do conector já existe. Por favor, escolha um nome diferente.',
  idp_initiated_authentication_not_supported:
    'A autenticação iniciada pelo IdP é suportada exclusivamente para conectores SAML.',
  idp_initiated_authentication_invalid_application_type:
    'Tipo de aplicativo inválido. Apenas aplicativos {{type}} são permitidos.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'O redirect_uri não está registrado. Por favor, verifique as configurações do aplicativo.',
  idp_initiated_authentication_client_callback_uri_not_found:
    'O URI de callback da autenticação iniciada pelo cliente IdP não foi encontrado. Por favor, verifique as configurações do conector.',
};

export default Object.freeze(single_sign_on);
