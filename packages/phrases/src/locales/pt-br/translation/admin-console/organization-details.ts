const organization_details = {
  page_title: 'Detalhes da organização',
  delete_confirmation:
    'Uma vez excluída, todos os membros perderão sua associação e cargos nesta organização. Essa ação não pode ser desfeita.',
  organization_id: 'ID da organização',
  settings_description:
    'Organizações representam as equipes, clientes empresariais e empresas parceiras que podem acessar suas aplicações.',
  name_placeholder: 'O nome da organização, não é necessário ser único.',
  description_placeholder: 'Uma descrição da organização.',
  member: 'Membro',
  member_other: 'Membros',
  add_members_to_organization: 'Adicionar membros à organização {{name}}',
  add_members_to_organization_description:
    'Encontre usuários apropriados pesquisando nome, e-mail, telefone ou ID do usuário. Membros existentes não são mostrados nos resultados da pesquisa.',
  add_with_organization_role: 'Adicionar com função(ões) na organização',
  user: 'Usuário',
  application: 'Aplicação',
  application_other: 'Aplicações',
  add_applications_to_organization: 'Adicionar aplicações à organização {{name}}',
  add_applications_to_organization_description:
    'Encontre aplicações apropriadas pesquisando pelo ID do aplicativo, nome ou descrição. Aplicaçōes existentes não são mostradas nos resultados da pesquisa.',
  at_least_one_application: 'Pelo menos uma aplicação é necessária.',
  remove_application_from_organization: 'Remover aplicação da organização',
  remove_application_from_organization_description:
    'Uma vez removida, a aplicação perderá sua associação e funções nesta organização. Essa ação não pode ser desfeita.',
  search_application_placeholder: 'Pesquise pelo ID do aplicativo, nome ou descrição',
  roles: 'Funções da organização',
  authorize_to_roles: 'Autorizar {{name}} a acessar os seguintes cargos:',
  edit_organization_roles: 'Editar cargos da organização',
  edit_organization_roles_title: 'Editar cargos da organização de {{name}}',
  remove_user_from_organization: 'Remover usuário da organização',
  remove_user_from_organization_description:
    'Uma vez removido, o usuário perderá sua associação e cargos nesta organização. Essa ação não pode ser desfeita.',
  search_user_placeholder: 'Pesquisar por nome, e-mail, telefone ou ID do usuário',
  at_least_one_user: 'Pelo menos um usuário é necessário.',
  organization_roles_tooltip: 'As funções atribuídas ao {{type}} dentro desta organização.',
  custom_data: 'Dados personalizados',
  custom_data_tip:
    'Dados personalizados é um objeto JSON que pode ser usado para armazenar dados adicionais associados à organização.',
  invalid_json_object: 'Objeto JSON inválido.',
  branding: {
    logo: 'Logotipos da organização',
    logo_tooltip:
      'Você pode passar o ID da organização para exibir este logotipo na experiência de login; a versão escura do logotipo é necessária se o modo escuro estiver habilitado nas configurações da experiência de login omni. <a>Saiba mais</a>',
  },
  jit: {
    title: 'Provisionamento Just-in-time',
    description:
      'Os usuários podem ingressar automaticamente na organização e serem atribuídos a funções na primeira vez que fizerem login através de alguns métodos de autenticação. Você pode definir os requisitos para o provisionamento just-in-time.',
    email_domain: 'Provisionamento de domínio de e-mail',
    email_domain_description:
      'Novos usuários que se inscreverem com seus endereços de e-mail verificados ou através do login social com endereços de e-mail verificados ingressarão automaticamente na organização. <a>Saiba mais</a>',
    email_domain_placeholder: 'Digite domínios de e-mail para provisionamento just-in-time',
    invalid_domain: 'Domínio inválido',
    domain_already_added: 'Domínio já adicionado',
    sso_enabled_domain_warning:
      'Você inseriu um ou mais domínios de e-mail associados ao SSO empresarial. Usuários com esses e-mails seguirão o fluxo padrão do SSO e não serão provisionados para esta organização, a menos que o provisionamento do SSO empresarial esteja configurado.',
    enterprise_sso: 'Provisionamento SSO empresarial',
    no_enterprise_connector_set:
      'Você ainda não configurou nenhum conector de SSO empresarial. Adicione conectores primeiro para habilitar o provisionamento SSO empresarial. <a>Configurar</a>',
    add_enterprise_connector: 'Adicionar conector empresarial',
    enterprise_sso_description:
      'Novos usuários ou usuários existentes que fizerem login através de SSO empresarial pela primeira vez ingressarão automaticamente na organização. <a>Saiba mais</a>',
    organization_roles: 'Funções padrão da organização',
    organization_roles_description:
      'Atribuir funções aos usuários ao ingressar na organização através do provisionamento just-in-time.',
  },
  mfa: {
    title: 'Autenticação multifator (MFA)',
    tip: 'Quando a MFA é necessária, usuários sem MFA configurada serão rejeitados ao tentar trocar um token da organização. Esta configuração não afeta a autenticação do usuário.',
    description:
      'Requerer aos usuários que configurem a autenticação multifator para acessar esta organização.',
    no_mfa_warning:
      'Nenhum método de autenticação multifator está habilitado para seu locatário. Os usuários não poderão acessar esta organização até que pelo menos um <a>método de autenticação multifator</a> esteja habilitado.',
  },
};

export default Object.freeze(organization_details);
