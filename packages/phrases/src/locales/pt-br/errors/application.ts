const application = {
  invalid_type: 'Apenas aplicações de máquina para máquina podem ter funções associadas.',
  role_exists: 'O id da função {{roleId}} já foi adicionado a este aplicativo.',
  invalid_role_type:
    'Não é possível atribuir uma função de tipo de usuário a um aplicativo de máquina para máquina.',
  invalid_third_party_application_type:
    'Apenas aplicativos da web tradicionais podem ser marcados como um aplicativo de terceiros.',
  third_party_application_only: 'O recurso está disponível apenas para aplicativos de terceiros.',
  user_consent_scopes_not_found: 'Escopos de consentimento do usuário inválidos.',
  protected_app_metadata_is_required: 'Protegido metadados do app é necessário.',
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
