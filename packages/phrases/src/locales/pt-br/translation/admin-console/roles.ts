const roles = {
  page_title: 'Títulos das funções',
  title: 'Funções',
  subtitle:
    'As funções incluem permissões que determinam o que um usuário pode fazer. O RBAC usa funções para dar aos usuários acesso a recursos para ações específicas.',
  create: 'Criar função',
  role_name: 'Nome da função',
  role_type: 'Tipo de função',
  show_role_type_button_text: 'Mostrar mais opções',
  hide_role_type_button_text: 'Esconder mais opções',
  type_user: 'Função do usuário',
  type_machine_to_machine: 'Função de aplicativo de máquina para máquina',
  role_description: 'Descrição',
  role_name_placeholder: 'Insira o nome da sua função',
  role_description_placeholder: 'Insira a descrição da sua função',
  col_roles: 'Funções',
  col_type: 'Tipo',
  col_description: 'Descrição',
  col_assigned_entities: 'Atribuído',
  user_counts: '{{count}} usuários',
  application_counts: '{{count}} aplicativos',
  user_count: '{{count}} usuário',
  application_count: '{{count}} aplicativo',
  assign_permissions: 'Atribuir permissões',
  create_role_title: 'Criar função',
  create_role_description:
    'Crie e gerencie funções para suas aplicações. As funções contêm coleções de permissões e podem ser atribuídas a usuários.',
  create_role_button: 'Criar função',
  role_created: 'A função {{name}} foi criada com sucesso.',
  search: 'Pesquisar pelo nome, descrição ou ID da função',
  placeholder_title: 'Funções',
  placeholder_description:
    'As funções são um agrupamento de permissões que podem ser atribuídas a usuários. Certifique-se de adicionar as permissões antes de criar funções.',
  assign_user_roles: 'Atribuir funções de usuário',
  assign_m2m_roles: 'Atribuir funções de máquina para máquina',
  management_api_access_notification:
    'Para acessar a API de gerenciamento do Logto, selecione funções com permissões de API de gerenciamento <flag/>.',
  with_management_api_access_tip:
    'Esta função de máquina para máquina inclui permissões para a API de gerenciamento do Logto',
};

export default Object.freeze(roles);
