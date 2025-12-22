const application = {
  invalid_type: 'Apenas as aplicações de máquina a máquina podem ter funções associadas.',
  role_exists: 'O id da função {{roleId}} já foi adicionado a esta aplicação.',
  invalid_role_type:
    'Não é possível atribuir uma função de tipo de utilizador a uma aplicação de máquina a máquina.',
  invalid_third_party_application_type:
    'Apenas aplicações web tradicionais, de página única e nativas podem ser marcadas como aplicações de terceiros.',
  third_party_application_only: 'A funcionalidade só está disponível para aplicações de terceiros.',
  user_consent_scopes_not_found: 'Escopos de consentimento de utilizador inválidos.',
  consent_management_api_scopes_not_allowed: 'Os escopos de API de gestão não são permitidos.',
  protected_app_metadata_is_required: 'Metadados de aplicação protegida são necessários.',
  protected_app_not_configured:
    'O provedor de aplicação protegida não está configurado. Esta funcionalidade não está disponível na versão de código aberto.',
  cloudflare_unknown_error: 'Erro desconhecido ao solicitar API da Cloudflare',
  protected_application_only: 'A funcionalidade só está disponível para aplicações protegidas.',
  protected_application_misconfigured: 'Aplicação protegida está mal configurada.',
  protected_application_subdomain_exists: 'O subdomínio da aplicação protegida já está em uso.',
  invalid_subdomain: 'Subdomínio inválido.',
  custom_domain_not_found: 'Domínio personalizado não encontrado.',
  should_delete_custom_domains_first: 'Deve eliminar primeiro os domínios personalizados.',
  no_legacy_secret_found: 'A aplicação não tem um segredo legado.',
  secret_name_exists: 'O nome do segredo já existe.',
  saml: {
    use_saml_app_api: 'Use a API `[METHOD] /saml-applications(/.*)?` para operar a app SAML.',
    saml_application_only: 'A API está disponível apenas para aplicações SAML.',
    reach_oss_limit: 'NÃO PODE criar mais apps SAML, pois o limite de {{limit}} foi atingido.',
    acs_url_binding_not_supported:
      'Apenas a ligação HTTP-POST é suportada para receber assertivas SAML.',
    can_not_delete_active_secret: 'Não é possível eliminar o segredo ativo.',
    no_active_secret: 'Nenhum segredo ativo encontrado.',
    entity_id_required: 'O ID da Entidade é necessário para gerar metadados.',
    name_id_format_required: 'O formato do ID do Nome é necessário.',
    unsupported_name_id_format: 'Formato do ID do Nome não suportado.',
    missing_email_address: 'O utilizador não tem um endereço de email.',
    email_address_unverified: 'O endereço de email do utilizador não está verificado.',
    invalid_certificate_pem_format: 'Formato de certificado PEM inválido.',
    acs_url_required: 'O URL do Serviço Consumidor de Assertions é necessário.',
    private_key_required: 'A chave privada é necessária.',
    certificate_required: 'O certificado é necessário.',
    invalid_saml_request: 'Pedido de autenticação SAML inválido.',
    auth_request_issuer_not_match:
      'O emissor do pedido de autenticação SAML não coincide com o ID da entidade do provedor de serviço.',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'O ID da sessão SSO SAML iniciada pelo provedor de serviço não foi encontrado em cookies.',
    sp_initiated_saml_sso_session_not_found:
      'A sessão SSO SAML iniciada pelo provedor de serviço não foi encontrada.',
    state_mismatch: 'Incompatibilidade de `state`.',
  },
};

export default Object.freeze(application);
