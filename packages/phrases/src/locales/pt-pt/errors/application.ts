const application = {
  invalid_type: 'Apenas as aplicações de máquina a máquina podem ter funções associadas.',
  role_exists: 'O id da função {{roleId}} já foi adicionado a esta aplicação.',
  invalid_role_type:
    'Não é possível atribuir uma função de tipo de utilizador a uma aplicação de máquina a máquina.',
  invalid_third_party_application_type:
    'Apenas aplicações web tradicionais podem ser marcadas como uma aplicação de terceiros.',
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
    /** UNTRANSLATED */
    use_saml_app_api: 'Use `[METHOD] /saml-applications(/.*)?` API to operate SAML app.',
    /** UNTRANSLATED */
    saml_application_only: 'The API is only available for SAML applications.',
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
