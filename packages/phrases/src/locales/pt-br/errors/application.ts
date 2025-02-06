const application = {
  invalid_type: 'Apenas aplicações de máquina para máquina podem ter funções associadas.',
  role_exists: 'O id da função {{roleId}} já foi adicionado a este aplicativo.',
  invalid_role_type:
    'Não é possível atribuir uma função de tipo de usuário a um aplicativo de máquina para máquina.',
  invalid_third_party_application_type:
    'Apenas aplicativos da web tradicionais podem ser marcados como um aplicativo de terceiros.',
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
    /** UNTRANSLATED */
    use_saml_app_api: 'Use `[METHOD] /saml-applications(/.*)?` API to operate SAML app.',
    /** UNTRANSLATED */
    saml_application_only: 'The API is only available for SAML applications.',
    /** UNTRANSLATED */
    reach_oss_limit: 'You CAN NOT create more SAML apps since the limit of {{limit}} is hit.',
    /** UNTRANSLATED */
    acs_url_binding_not_supported:
      'Only HTTP-POST binding is supported for receiving SAML assertions.',
    /** UNTRANSLATED */
    can_not_delete_active_secret: 'Can not delete the active secret.',
    /** UNTRANSLATED */
    no_active_secret: 'No active secret found.',
    /** UNTRANSLATED */
    entity_id_required: 'Entity ID is required to generate metadata.',
    /** UNTRANSLATED */
    name_id_format_required: 'Name ID format is required.',
    /** UNTRANSLATED */
    unsupported_name_id_format: 'Unsupported name ID format.',
    /** UNTRANSLATED */
    missing_email_address: 'User does not have an email address.',
    /** UNTRANSLATED */
    email_address_unverified: 'User email address is not verified.',
    /** UNTRANSLATED */
    invalid_certificate_pem_format: 'Invalid PEM certificate format',
    /** UNTRANSLATED */
    acs_url_required: 'Assertion Consumer Service URL is required.',
    /** UNTRANSLATED */
    private_key_required: 'Private key is required.',
    /** UNTRANSLATED */
    certificate_required: 'Certificate is required.',
    /** UNTRANSLATED */
    invalid_saml_request: 'Invalid SAML authentication request.',
    /** UNTRANSLATED */
    auth_request_issuer_not_match:
      'The issuer of the SAML authentication request mismatch with service provider entity ID.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'Service provider initiated SAML SSO session ID not found in cookies.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found:
      'Service provider initiated SAML SSO session not found.',
    /** UNTRANSLATED */
    state_mismatch: '`state` mismatch.',
  },
};

export default Object.freeze(application);
