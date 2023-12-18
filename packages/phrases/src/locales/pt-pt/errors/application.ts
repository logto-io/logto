const application = {
  invalid_type: 'Apenas aplicações máquina a máquina podem ter funções associadas.',
  role_exists: 'O id da função {{roleId}} já foi adicionado a esta aplicação.',
  invalid_role_type:
    'Não é possível atribuir uma função de tipo de utilizador a uma aplicação máquina a máquina.',
  invalid_third_party_application_type:
    'Apenas aplicações web tradicionais podem ser marcadas como uma aplicação de terceiros.',
  third_party_application_only: 'A funcionalidade só está disponível para aplicações de terceiros.',
  user_consent_scopes_not_found: 'Escopos de consentimento de utilizador inválidos.',
  /** UNTRANSLATED */
  protected_app_metadata_is_required: 'Protected app metadata is required.',
};

export default Object.freeze(application);
