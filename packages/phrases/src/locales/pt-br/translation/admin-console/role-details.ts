const role_details = {
  back_to_roles: 'Voltar para os Papéis',
  identifier: 'Identificador',
  delete_description:
    'Fazê-lo removerá as permissões associadas a este papel dos usuários afetados e excluirá o mapeamento entre papéis, usuários e permissões.',
  role_deleted: '{{name}} foi excluído com sucesso.',
  settings_tab: 'Configurações',
  users_tab: 'Usuários',
  /** UNTRANSLATED */
  m2m_apps_tab: 'Machine-to-machine apps',
  permissions_tab: 'Permissões',
  settings: 'Configurações',
  settings_description:
    'Os papéis são um agrupamento de permissões que podem ser atribuídas a usuários. Eles também fornecem uma maneira de agregar permissões definidas para diferentes APIs, tornando mais eficiente a adição, remoção ou ajuste de permissões em comparação com a atribuição individual a usuários.',
  field_name: 'Nome',
  field_description: 'Descrição',
  /** UNTRANSLATED */
  type_m2m_role_tag: 'Machine-to-machine app role',
  /** UNTRANSLATED */
  type_user_role_tag: 'User role',
  permission: {
    assign_button: 'Atribuir permissões',
    assign_title: 'Atribuir permissões',
    assign_subtitle:
      'Atribua permissões a este papel. O papel adquirirá as permissões adicionadas e os usuários com este papel herdarão essas permissões.',
    assign_form_field: 'Atribuir permissões',
    added_text_one: '{{count, number}} permissão adicionada',
    added_text_other: '{{count, number}} permissões adicionadas',
    api_permission_count_one: '{{count, number}} permissão',
    api_permission_count_other: '{{count, number}} permissões',
    confirm_assign: 'Atribuir permissões',
    permission_assigned: 'As permissões selecionadas foram atribuídas com sucesso a este papel',
    deletion_description:
      'Se esta permissão for removida, o usuário afetado com este papel perderá o acesso concedido por esta permissão.',
    permission_deleted: 'A permissão "{{name}}" foi removida com sucesso deste papel',
    empty: 'Nenhuma permissão disponível',
  },
  users: {
    assign_button: 'Atribuir usuários',
    name_column: 'Usuário',
    app_column: 'Aplicativo',
    latest_sign_in_column: 'Último acesso',
    delete_description:
      'Ele permanecerá no seu pool de usuários, mas perderá a autorização para este papel.',
    deleted: '{{name}} foi removido com sucesso deste papel',
    assign_title: 'Atribuir usuários',
    assign_subtitle:
      'Atribuir usuários a este papel. Encontre usuários adequados pesquisando nome, e-mail, telefone ou ID do usuário.',
    assign_users_field: 'Atribuir usuários',
    confirm_assign: 'Atribuir usuários',
    users_assigned: 'Os usuários selecionados foram atribuídos com sucesso a este papel',
    empty: 'Nenhum usuário disponível',
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
