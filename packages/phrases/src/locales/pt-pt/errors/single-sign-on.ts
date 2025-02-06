const single_sign_on = {
  forbidden_domains: 'Os domínios de email público não são permitidos.',
  duplicated_domains: 'Existem domínios duplicados.',
  invalid_domain_format: 'Formato de domínio inválido.',
  duplicate_connector_name: 'O nome do conector já existe. Por favor, escolha um nome diferente.',
  idp_initiated_authentication_not_supported:
    'A autenticação iniciada pelo IdP é suportada exclusivamente para conectores SAML.',
  idp_initiated_authentication_invalid_application_type:
    'Tipo de aplicação inválido. Apenas aplicações {{type}} são permitidas.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'O redirect_uri não está registado. Por favor, verifique as definições da aplicação.',
  idp_initiated_authentication_client_callback_uri_not_found:
    'O URI de callback de autenticação iniciada pelo IdP no cliente não foi encontrado. Por favor, verifique as definições do conector.',
};

export default Object.freeze(single_sign_on);
