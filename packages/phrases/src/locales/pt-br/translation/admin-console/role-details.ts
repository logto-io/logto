const role_details = {
  back_to_roles: 'Voltar para os Papéis',
  identifier: 'Identificador',
  delete_description:
    'Fazê-lo removerá as permissões associadas a este papel dos usuários afetados e excluirá o mapeamento entre papéis, usuários e permissões.',
  role_deleted: '{{name}} foi excluído com sucesso.',
  general_tab: 'Geral',
  users_tab: 'Usuários',
  m2m_apps_tab: 'Aplicativos máquina-a-máquina',
  permissions_tab: 'Permissões',
  settings: 'Configurações',
  settings_description:
    'Os papéis são um agrupamento de permissões que podem ser atribuídas a usuários. Eles também fornecem uma maneira de agregar permissões definidas para diferentes APIs, tornando mais eficiente a adição, remoção ou ajuste de permissões em comparação com a atribuição individual a usuários.',
  field_name: 'Nome',
  field_description: 'Descrição',
  field_is_default: 'Função padrão',
  field_is_default_description:
    'Defina este papel como um papel padrão para novos usuários. Vários papéis padrão podem ser definidos. Isso também afetará os papéis padrão para usuários criados via API de Gerenciamento.',
  type_m2m_role_tag: 'Função de aplicativo máquina-a-máquina',
  type_user_role_tag: 'Função de usuário',
  m2m_role_notification:
    'Atribua essa função de máquina para máquina a um aplicativo de máquina para máquina para conceder acesso aos recursos de API relativos. <a>Crie primeiro um aplicativo de máquina para máquina</a> se ainda não o fez.',
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
    assign_field: 'Atribuir usuários',
    confirm_assign: 'Atribuir usuários',
    assigned_toast_text: 'Os usuários selecionados foram atribuídos com sucesso a este papel',
    empty: 'Nenhum usuário disponível',
  },
  applications: {
    assign_button: 'Atribuir aplicativos',
    name_column: 'Aplicativo',
    app_column: 'Aplicativos',
    description_column: 'Descrição',
    delete_description:
      'Ele permanecerá em seu pool de aplicativos, mas perderá a autorização para este papel.',
    deleted: '{{name}} foi removido com sucesso deste papel',
    assign_title: 'Atribuir aplicativos',
    assign_subtitle:
      'Atribuir aplicativos a este papel. Encontre os aplicativos adequados pesquisando por nome, descrição ou ID do aplicativo.',
    assign_field: 'Atribuir aplicativos',
    confirm_assign: 'Atribuir aplicativos',
    assigned_toast_text: 'Os aplicativos selecionados foram atribuídos com sucesso a este papel',
    empty: 'Nenhum aplicativo disponível',
  },
};

export default Object.freeze(role_details);
