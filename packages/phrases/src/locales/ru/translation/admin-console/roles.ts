const roles = {
  page_title: 'Роли',
  title: 'Роли',
  subtitle:
    'Роли включают права доступа, которые определяют, что может делать пользователь. RBAC использует роли для предоставления пользователям доступа к ресурсам для конкретных действий.',
  create: 'Создать роль',
  role_name: 'Имя роли',
  role_type: 'Тип роли',
  type_user: 'Пользователь',
  type_machine_to_machine: 'Машина-к-машине',
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
    'Используйте роли для организации прав доступа и назначения их пользователям.',
  create_role_button: 'Создать роль',
  role_created: 'Роль "{{name}}" успешно создана.',
  search: 'Поиск по названию роли, описанию или ID',
  placeholder_title: 'Роли',
  placeholder_description:
    'Роли являются группировкой разрешений, которые могут быть назначены пользователям. Необходимо добавить разрешения, прежде чем создать роли.',
  assign_roles: 'Назначить роли',
  management_api_access_notification:
    'Для доступа к API управления Logto выберите роли с разрешениями API управления <flag/>.',
  with_management_api_access_tip:
    'Эта роль от машины к машине включает разрешения для API управления Logto',
  role_creation_hint: 'Не можете найти подходящую роль? <a>Создать роль</a>',
};

export default Object.freeze(roles);
