const role_details = {
  back_to_roles: 'Voltar para Funções',
  identifier: 'Identificador',
  delete_description:
    'Ao fazê-lo, serão removidas as permissões associadas a esta função dos utilizadores afetados e eliminado o mapeamento entre funções, utilizadores e permissões.',
  role_deleted: '{{name}} foi eliminada com sucesso.',
  settings_tab: 'Definições',
  users_tab: 'Utilizadores',
  /** UNTRANSLATED */
  m2m_apps_tab: 'Machine-to-machine apps',
  permissions_tab: 'Permissões',
  settings: 'Definições',
  settings_description:
    'As funções são um agrupamento de permissões que podem ser atribuídas aos utilizadores. Elas também proporcionam uma forma de agregar permissões definidas para diferentes APIs, tornando mais eficiente adicionar, remover ou ajustar permissões comparativamente à sua atribuição individual a utilizadores.',
  field_name: 'Nome',
  field_description: 'Descrição',
  /** UNTRANSLATED */
  type_m2m_role_tag: 'Machine-to-machine app role',
  /** UNTRANSLATED */
  type_user_role_tag: 'User role',
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
    assign_users_field: 'Atribuir utilizadores',
    confirm_assign: 'Atribuir utilizadores',
    users_assigned: 'Os utilizadores selecionados foram atribuídos com sucesso a esta função',
    empty: 'Nenhum utilizador disponível',
  },
  applications: {
    /** UNTRANSLATED */
    assign_button: 'Assign applications',
    /** UNTRANSLATED */
    name_column: 'Application',
    /** UNTRANSLATED */
    app_column: 'Apps',
    /** UNTRANSLATED */
    description_column: 'Description',
    /** UNTRANSLATED */
    delete_description:
      'It will remain in your application pool but lose the authorization for this role.',
    /** UNTRANSLATED */
    deleted: '{{name}} was successfully removed from this role',
    /** UNTRANSLATED */
    assign_title: 'Assign apps',
    /** UNTRANSLATED */
    assign_subtitle:
      'Assign applications to this role. Find appropriate applications by searching name, description or app ID.',
    /** UNTRANSLATED */
    assign_applications_field: 'Assign applications',
    /** UNTRANSLATED */
    confirm_assign: 'Assign applications',
    /** UNTRANSLATED */
    applications_assigned: 'The selected applications were successfully assigned to this role',
    /** UNTRANSLATED */
    empty: 'No application available',
  },
};

export default Object.freeze(role_details);
