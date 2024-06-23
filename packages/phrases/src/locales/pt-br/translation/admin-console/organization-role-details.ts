const organization_role_details = {
  page_title: 'Detalhes da função da organização',
  back_to_org_roles: 'Voltar para os papéis da organização',
  delete_confirm:
    'Ao fazer isso, os privilégios associados a esta função serão removidos dos usuários afetados e as relações entre funções da organização, membros na organização e permissões da organização serão excluídas.',
  deleted: 'O papel da organização {{name}} foi excluído com sucesso.',
  permissions: {
    tab: 'Permissões',
    name_column: 'Permissão',
    description_column: 'Descrição',
    type_column: 'Tipo de permissão',
    type: {
      api: 'Permissão da API',
      org: 'Permissão da organização',
    },
    assign_permissions: 'Atribuir permissões',
    remove_permission: 'Remover permissão',
    remove_confirmation:
      'Se esta permissão for removida, o usuário com essa função organizacional perderá o acesso concedido por esta permissão.',
    removed: 'A permissão {{name}} foi removida com sucesso desta função organizacional',
    assign_description:
      'Atribua permissões aos papéis dentro desta organização. Estas podem incluir tanto permissões de organização quanto permissões de API.',
    organization_permissions: 'Permissões de organização',
    api_permissions: 'Permissões de API',
    assign_organization_permissions: 'Atribuir permissões de organização',
    assign_api_permissions: 'Atribuir permissões de API',
  },
  general: {
    tab: 'Geral',
    settings: 'Configurações',
    description:
      'Função de organização é um agrupamento de permissões que podem ser atribuídas aos usuários. As permissões podem vir das permissões de organização pré-definidas e permissões de API.',
    name_field: 'Nome',
    description_field: 'Descrição',
    description_field_placeholder: 'Usuários com permissões somente de visualização',
  },
};

export default Object.freeze(organization_role_details);
