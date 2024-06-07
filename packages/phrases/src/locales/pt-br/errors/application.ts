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
};

export default Object.freeze(application);
