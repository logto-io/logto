const roles = {
  page_title: 'Роли',
  title: 'Роли',
  subtitle:
    'Роли включают права доступа, которые определяют, что может делать пользователь. RBAC использует роли для предоставления пользователям доступа к ресурсам для конкретных действий.',
  create: 'Создать роль',
  role_name: 'Имя роли',
  role_type: 'Тип роли',
  show_role_type_button_text: 'Показать дополнительные варианты',
  hide_role_type_button_text: 'Скрыть дополнительные варианты',
  type_user: 'Роль пользователя',
  type_machine_to_machine: 'Роль приложения между машинами',
  role_description: 'Описание',
  role_name_placeholder: 'Введите название роли',
  role_description_placeholder: 'Введите описание роли',
  col_roles: 'Роли',
  col_type: 'Тип',
  col_description: 'Описание',
  col_assigned_entities: 'Назначенные',
  user_counts: '{{count}} пользователей',
  application_counts: '{{count}} приложений',
  user_count: '{{count}} пользователь',
  application_count: '{{count}} приложение',
  assign_permissions: 'Назначить права доступа',
  create_role_title: 'Создать роль',
  create_role_description:
    'Создание и управление ролями для ваших приложений. Роли содержат коллекции прав доступа и могут быть назначены пользователям.',
  create_role_button: 'Создать роль',
  role_created: 'Роль "{{name}}" успешно создана.',
  search: 'Поиск по названию роли, описанию или ID',
  placeholder_title: 'Роли',
  placeholder_description:
    'Роли являются группировкой разрешений, которые могут быть назначены пользователям. Необходимо добавить разрешения, прежде чем создать роли.',
  assign_user_roles: 'Назначить роли пользователя',
  assign_m2m_roles: 'Назначить роли от машины к машине',
  management_api_access_notification:
    'Для доступа к API управления Logto выберите роли с разрешениями API управления <flag/>.',
  with_management_api_access_tip:
    'Эта роль от машины к машине включает разрешения для API управления Logto',
};

export default Object.freeze(roles);
