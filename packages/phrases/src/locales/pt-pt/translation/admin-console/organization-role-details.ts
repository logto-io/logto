const organization_role_details = {
  page_title: 'Detalhes da função da organização',
  back_to_org_roles: 'Voltar aos papéis da organização',
  delete_confirm:
    'Ao fazê-lo, serão removidas as permissões associadas a esta função dos utilizadores afetados e serão eliminadas as relações entre funções da organização, membros na organização e permissões da organização.',
  deleted: 'O papel da organização {{name}} foi eliminado com sucesso.',
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
      'Se esta permissão for removida, o utilizador com esta função organizacional perderá o acesso concedido por esta permissão.',
    removed: 'A permissão {{name}} foi removida com sucesso desta função organizacional',
    assign_description:
      'Atribuir permissões aos cargos dentro desta organização. Estas podem incluir permissões de organização e permissões de API.',
    organization_permissions: 'Permissões de organização',
    api_permissions: 'Permissões de API',
    assign_organization_permissions: 'Atribuir permissões de organização',
    assign_api_permissions: 'Atribuir permissões de API',
  },
  general: {
    tab: 'Geral',
    settings: 'Configurações',
    description:
      'O papel da organização é um agrupamento de permissões que podem ser atribuídas aos utilizadores. As permissões podem provir das permissões da organização pré-definidas e permissões de API.',
    name_field: 'Nome',
    description_field: 'Descrição',
    description_field_placeholder: 'Utilizadores com permissões apenas de visualização',
  },
};

export default Object.freeze(organization_role_details);
