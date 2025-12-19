const application = {
  invalid_type: 'Apenas aplicações de máquina para máquina podem ter funções associadas.',
  role_exists: 'O id da função {{roleId}} já foi adicionado a este aplicativo.',
  invalid_role_type:
    'Não é possível atribuir uma função de tipo de usuário a um aplicativo de máquina para máquina.',
  invalid_third_party_application_type:
    'Apenas aplicativos da web tradicionais, de página única e nativos podem ser marcados como aplicativos de terceiros.',
  third_party_application_only: 'O recurso está disponível apenas para aplicativos de terceiros.',
  user_consent_scopes_not_found: 'Escopos de consentimento do usuário inválidos.',
  consent_management_api_scopes_not_allowed:
    'Os escopos da API de gerenciamento não são permitidos.',
  protected_app_metadata_is_required: 'Protegido metadados do app é necessário.',
  protected_app_not_configured:
    'Provedor de app protegido não está configurado. Este recurso não está disponível na versão de código aberto.',
  cloudflare_unknown_error: 'Erro desconhecido ao solicitar a API do Cloudflare',
  protected_application_only: 'O recurso está disponível apenas para aplicativos protegidos.',
  protected_application_misconfigured: 'O aplicativo protegido está mal configurado.',
  protected_application_subdomain_exists: 'O subdomínio do aplicativo protegido já está em uso.',
  invalid_subdomain: 'Subdomínio inválido.',
  custom_domain_not_found: 'Domínio personalizado não encontrado.',
  should_delete_custom_domains_first: 'Deve excluir os domínios personalizados primeiro.',
  no_legacy_secret_found: 'O aplicativo não tem um segredo legado.',
  secret_name_exists: 'Nome do segredo já existe.',
  saml: {
    use_saml_app_api:
      'Use a API `[METHOD] /saml-applications(/.*)?` para operar o aplicativo SAML.',
    saml_application_only: 'A API está disponível apenas para aplicativos SAML.',
    reach_oss_limit:
      'Você NÃO PODE criar mais aplicativos SAML, pois o limite de {{limit}} foi atingido.',
    acs_url_binding_not_supported:
      'Apenas a vinculação HTTP-POST é suportada para receber assertivas SAML.',
    can_not_delete_active_secret: 'Não é possível excluir o segredo ativo.',
    no_active_secret: 'Nenhum segredo ativo encontrado.',
    entity_id_required: 'ID da entidade é necessário para gerar metadados.',
    name_id_format_required: 'Formato do ID de nome é necessário.',
    unsupported_name_id_format: 'Formato de ID de nome não suportado.',
    missing_email_address: 'O usuário não tem um endereço de e-mail.',
    email_address_unverified: 'O endereço de e-mail do usuário não está verificado.',
    invalid_certificate_pem_format: 'Formato de certificado PEM inválido',
    acs_url_required: 'URL do Serviço Consumidor de Assertiva é necessária.',
    private_key_required: 'Chave privada é necessária.',
    certificate_required: 'Certificado é necessário.',
    invalid_saml_request: 'Solicitação de autenticação SAML inválida.',
    auth_request_issuer_not_match:
      'O emissor da solicitação de autenticação SAML não corresponde ao ID da entidade do provedor de serviço.',
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'ID da sessão SSO iniciada pelo provedor de serviço SAML não encontrado nos cookies.',
    sp_initiated_saml_sso_session_not_found:
      'Sessão SSO iniciada pelo provedor de serviço SAML não encontrada.',
    state_mismatch: 'Incompatibilidade de `state`.',
  },
};

export default Object.freeze(application);
