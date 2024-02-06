const application = {
  invalid_type: 'Apenas aplicações de máquina para máquina podem ter funções associadas.',
  role_exists: 'O id da função {{roleId}} já foi adicionado a este aplicativo.',
  invalid_role_type:
    'Não é possível atribuir uma função de tipo de usuário a um aplicativo de máquina para máquina.',
  invalid_third_party_application_type:
    'Apenas aplicativos da web tradicionais podem ser marcados como um aplicativo de terceiros.',
  third_party_application_only: 'O recurso está disponível apenas para aplicativos de terceiros.',
  user_consent_scopes_not_found: 'Escopos de consentimento do usuário inválidos.',
  /** UNTRANSLATED */
  consent_management_api_scopes_not_allowed: 'Management API scopes are not allowed.',
  protected_app_metadata_is_required: 'Protegido metadados do app é necessário.',
  /** UNTRANSLATED */
  protected_app_not_configured:
    'Protected app provider is not configured. This feature is not available for open source version.',
  /** UNTRANSLATED */
  cloudflare_unknown_error: 'Got unknown error when requesting Cloudflare API',
  /** UNTRANSLATED */
  protected_application_only: 'The feature is only available for protected applications.',
  /** UNTRANSLATED */
  protected_application_misconfigured: 'Protected application is misconfigured.',
  /** UNTRANSLATED */
  protected_application_subdomain_exists:
    'The subdomain of Protected application is already in use.',
  /** UNTRANSLATED */
  invalid_subdomain: 'Invalid subdomain.',
  /** UNTRANSLATED */
  custom_domain_not_found: 'Custom domain not found.',
  /** UNTRANSLATED */
  should_delete_custom_domains_first: 'Should delete custom domains first.',
};

export default Object.freeze(application);
