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
};

export default Object.freeze(application);
