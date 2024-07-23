const organization_details = {
  page_title: 'Detalhes da organização',
  delete_confirmation:
    'Uma vez eliminada, todos os membros perderão a sua adesão e funções nesta organização. Esta ação não pode ser desfeita.',
  organization_id: 'ID da organização',
  settings_description:
    'As organizações representam as equipas, clientes empresariais e empresas parceiras que podem aceder às suas aplicações.',
  name_placeholder: 'O nome da organização, não é necessário ser único.',
  description_placeholder: 'Uma descrição da organização.',
  member: 'Membro',
  member_other: 'Membros',
  add_members_to_organization: 'Adicionar membros à organização {{name}}',
  add_members_to_organization_description:
    'Encontre utilizadores adequados pesquisando por nome, email, telefone ou ID de utilizador. Os membros existentes não são mostrados nos resultados da pesquisa.',
  add_with_organization_role: 'Adicionar com função(ões) de organização',
  user: 'Utilizador',
  application: 'Aplicação',
  application_other: 'Aplicações',
  add_applications_to_organization: 'Adicionar aplicações à organização {{name}}',
  add_applications_to_organization_description:
    'Encontre aplicações adequadas pesquisando pelo ID da aplicação, nome ou descrição. As aplicações existentes não são mostradas nos resultados da pesquisa.',
  at_least_one_application: 'É necessária pelo menos uma aplicação.',
  remove_application_from_organization: 'Remover aplicação da organização',
  remove_application_from_organization_description:
    'Uma vez removida, a aplicação perderá a sua associação e funções nesta organização. Esta ação não pode ser desfeita.',
  search_application_placeholder: 'Pesquisar pelo ID da aplicação, nome ou descrição',
  roles: 'Funções da organização',
  authorize_to_roles: 'Autorizar {{name}} a aceder às seguintes funções:',
  edit_organization_roles: 'Editar funções da organização',
  edit_organization_roles_title: 'Editar funções da organização de {{name}}',
  remove_user_from_organization: 'Remover utilizador da organização',
  remove_user_from_organization_description:
    'Uma vez removido, o utilizador perderá a sua adesão e funções nesta organização. Esta ação não pode ser desfeita.',
  search_user_placeholder: 'Pesquisar por nome, email, telefone ou ID de utilizador',
  at_least_one_user: 'Pelo menos um utilizador é necessário.',
  organization_roles_tooltip: 'As funções atribuídas ao {{type}} dentro desta organização.',
  custom_data: 'Dados personalizados',
  custom_data_tip:
    'Dados personalizados é um objeto JSON que pode ser usado para armazenar dados adicionais associados à organização.',
  invalid_json_object: 'Objeto JSON inválido.',
  branding: {
    logo: 'Logos da organização',
    logo_tooltip:
      'Pode passar o ID da organização para exibir este logo na experiência de login; a versão escura do logo é necessária se o modo escuro estiver ativado nas configurações da experiência de login omni. <a>Saiba mais</a>',
  },
  jit: {
    title: 'Provisionamento just-in-time',
    description:
      'Os utilizadores podem juntar-se automaticamente à organização e receber funções na sua primeira entrada através de alguns métodos de autenticação. Pode definir requisitos para o provisionamento just-in-time.',
    email_domain: 'Provisionamento de domínio de email',
    email_domain_description:
      'Novos utilizadores que se inscrevam com os seus endereços de email verificados ou através do login social com endereços de email verificados juntar-se-ão automaticamente à organização. <a>Saiba mais</a>',
    email_domain_placeholder: 'Introduza domínios de email para provisionamento just-in-time',
    invalid_domain: 'Domínio inválido',
    domain_already_added: 'Domínio já adicionado',
    sso_enabled_domain_warning:
      'Introduziu um ou mais domínios de email associados ao SSO empresarial. Os utilizadores com estes emails seguirão o fluxo padrão de SSO e não serão provisionados para esta organização a menos que o provisionamento de SSO empresarial esteja configurado.',
    enterprise_sso: 'Provisionamento de SSO empresarial',
    no_enterprise_connector_set:
      'Ainda não configurou nenhum conector de SSO empresarial. Adicione conectores primeiro para ativar o provisionamento de SSO empresarial. <a>Configurar</a>',
    add_enterprise_connector: 'Adicionar conector empresarial',
    enterprise_sso_description:
      'Novos utilizadores ou utilizadores existentes que iniciem sessão através do SSO empresarial pela primeira vez juntar-se-ão automaticamente à organização. <a>Saiba mais</a>',
    organization_roles: 'Funções padrão da organização',
    organization_roles_description:
      'Atribuir funções aos utilizadores ao juntarem-se à organização através do provisionamento just-in-time.',
  },
  mfa: {
    title: 'Autenticação de múltiplos fatores (MFA)',
    tip: 'Quando a MFA é necessária, os utilizadores sem MFA configurado serão recusados ao tentar trocar um token da organização. Esta configuração não afeta a autenticação do utilizador.',
    description:
      'Exigir que os utilizadores configurem a autenticação de múltiplos fatores para aceder a esta organização.',
    no_mfa_warning:
      'Nenhum método de autenticação de múltiplos fatores está habilitado para o seu inquilino. Os utilizadores não poderão aceder a esta organização até que pelo menos um <a>método de autenticação de múltiplos fatores</a> seja habilitado.',
  },
};

export default Object.freeze(organization_details);
