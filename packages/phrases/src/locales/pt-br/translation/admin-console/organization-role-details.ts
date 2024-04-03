const organization_role_details = {
  page_title: 'Detalhes da função da organização',
  back_to_org_roles: 'Voltar para funções da org',
  org_role: 'Função da organização',
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
      org: 'Permissão da org',
    },
    assign_permissions: 'Atribuir permissões',
    remove_permission: 'Remover permissão',
    remove_confirmation:
      'Se esta permissão for removida, o usuário com essa função organizacional perderá o acesso concedido por esta permissão.',
    removed: 'A permissão {{name}} foi removida com sucesso desta função organizacional',
  },
  general: {
    tab: 'Geral',
    settings: 'Configurações',
    description:
      'A função da organização é um agrupamento de permissões que podem ser atribuídas aos usuários. As permissões devem vir das permissões predefinidas da organização.',
    name_field: 'Nome',
    description_field: 'Descrição',
    description_field_placeholder: 'Usuários com permissões somente de visualização',
  },
};

export default Object.freeze(organization_role_details);
