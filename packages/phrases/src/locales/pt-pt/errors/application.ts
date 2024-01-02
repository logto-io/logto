const application = {
  invalid_type: 'Apenas as aplicações de máquina a máquina podem ter funções associadas.',
  role_exists: 'O id da função {{roleId}} já foi adicionado a esta aplicação.',
  invalid_role_type:
    'Não é possível atribuir uma função de tipo de utilizador a uma aplicação de máquina a máquina.',
  invalid_third_party_application_type:
    'Apenas aplicações web tradicionais podem ser marcadas como uma aplicação de terceiros.',
  third_party_application_only: 'A funcionalidade só está disponível para aplicações de terceiros.',
  user_consent_scopes_not_found: 'Escopos de consentimento de utilizador inválidos.',
  protected_app_metadata_is_required: 'Protected app metadata is required.',
  /** UNTRANSLATED */
  protected_app_not_configured: 'Protected app provider is not configured.',
  /** UNTRANSLATED */
  cloudflare_unknown_error: 'Got unknown error when requesting Cloudflare API',
  /** UNTRANSLATED */
  protected_application_only: 'The feature is only available for protected applications.',
  /** UNTRANSLATED */
  protected_application_misconfigured: 'Protected application is misconfigured.',
};

export default Object.freeze(application);
