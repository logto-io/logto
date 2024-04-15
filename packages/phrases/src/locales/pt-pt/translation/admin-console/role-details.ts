const role_details = {
  back_to_roles: 'Voltar para Funções',
  identifier: 'Identificador',
  delete_description:
    'Ao fazê-lo, serão removidas as permissões associadas a esta função dos utilizadores afetados e eliminado o mapeamento entre funções, utilizadores e permissões.',
  role_deleted: '{{name}} foi eliminada com sucesso.',
  general_tab: 'Geral',
  users_tab: 'Utilizadores',
  m2m_apps_tab: 'Aplicações de máquina para máquina',
  permissions_tab: 'Permissões',
  settings: 'Definições',
  settings_description:
    'As funções são um agrupamento de permissões que podem ser atribuídas aos utilizadores. Elas também proporcionam uma forma de agregar permissões definidas para diferentes APIs, tornando mais eficiente adicionar, remover ou ajustar permissões comparativamente à sua atribuição individual a utilizadores.',
  field_name: 'Nome',
  field_description: 'Descrição',
  type_m2m_role_tag: 'Função de aplicação de máquina para máquina',
  type_user_role_tag: 'Função de utilizador',
  permission: {
    assign_button: 'Atribuir Permissões',
    assign_title: 'Atribuir permissões',
    assign_subtitle:
      'Atribua permissões a esta função. A função irá obter as permissões adicionadas e os utilizadores com esta função herdarão essas permissões.',
    assign_form_field: 'Atribuir permissões',
    added_text_one: '{{count, number}} permissão adicionada',
    added_text_other: '{{count, number}} permissões adicionadas',
    api_permission_count_one: '{{count, number}} permissão',
    api_permission_count_other: '{{count, number}} permissões',
    confirm_assign: 'Atribuir Permissões',
    permission_assigned: 'As permissões selecionadas foram atribuídas com sucesso a esta função',
    deletion_description:
      'Se esta permissão for removida, o utilizador afetado com esta função perderá o acesso concedido por esta permissão.',
    permission_deleted: 'A permissão "{{name}}" foi removida com sucesso desta função',
    empty: 'Nenhuma permissão disponível',
  },
  users: {
    assign_button: 'Atribuir Utilizadores',
    name_column: 'Utilizador',
    app_column: 'Aplicação',
    latest_sign_in_column: 'Última sessão iniciada',
    delete_description:
      'Permanecerá no seu conjunto de utilizadores, mas perderá a autorização para esta função.',
    deleted: '{{name}} foi removido com sucesso desta função',
    assign_title: 'Atribuir utilizadores',
    assign_subtitle:
      'Atribua utilizadores a esta função. Encontre utilizadores apropriados pesquisando pelo nome, e-mail, telefone ou ID de utilizador.',
    assign_field: 'Atribuir utilizadores',
    confirm_assign: 'Atribuir utilizadores',
    assigned_toast_text: 'Os utilizadores selecionados foram atribuídos com sucesso a esta função',
    empty: 'Nenhum utilizador disponível',
  },
  applications: {
    assign_button: 'Atribuir aplicações',
    name_column: 'Aplicação',
    app_column: 'Aplicações',
    description_column: 'Descrição',
    delete_description:
      'Permanecerá no seu conjunto de aplicações, mas perderá a autorização para esta função.',
    deleted: '{{name}} foi removido com sucesso desta função',
    assign_title: 'Atribuir aplicações',
    assign_subtitle:
      'Atribua aplicações a esta função. Encontre aplicações apropriadas pesquisando pelo nome, descrição ou ID da aplicação.',
    assign_field: 'Atribuir aplicações',
    confirm_assign: 'Atribuir aplicações',
    assigned_toast_text: 'As aplicações selecionadas foram atribuídas com sucesso a esta função',
    empty: 'Nenhuma aplicação disponível',
  },
};

export default Object.freeze(role_details);
