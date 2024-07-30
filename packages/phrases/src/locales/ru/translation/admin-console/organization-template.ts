const organization_template = {
  title: 'Шаблон организации',
  subtitle:
    'В многоарендных SaaS-приложениях шаблон организации определяет общие политики контроля доступа (разрешения и роли) для нескольких организаций.',
  roles: {
    tab_name: 'Роли орг',
    search_placeholder: 'Поиск по названию роли',
    create_title: 'Создать роль орг',
    role_column: 'Роль орг',
    permissions_column: 'Разрешения',
    placeholder_title: 'Роль организации',
    placeholder_description:
      'Роль организации - это группировка разрешений, которые могут быть назначены пользователям. Разрешения должны происходить из предопределенных разрешений организации.',
    create_modal: {
      title: 'Создать роль организации',
      create: 'Создать роль',
      name: 'Название роли',
      description: 'Описание',
      type: 'Тип роли',
      created: 'Роль организации {{name}} успешно создана.',
    },
  },
  permissions: {
    tab_name: 'Разрешения орг',
    search_placeholder: 'Поиск по названию разрешения',
    create_org_permission: 'Создать разрешение орг',
    permission_column: 'Разрешение организации',
    description_column: 'Описание',
    placeholder_title: 'Разрешение организации',
    placeholder_description:
      'Разрешение организации относится к авторизации на доступ к ресурсу в контексте организации.',
    delete_confirm:
      'Если это разрешение будет удалено, все роли организации, включающие это разрешение, потеряют его, и пользователи, имевшие это разрешение, потеряют доступ, предоставленный им.',
    create_title: 'Создание разрешения организации',
    edit_title: 'Редактирование разрешения организации',
    permission_field_name: 'Название разрешения',
    description_field_name: 'Описание',
    description_field_placeholder: 'Читать историю назначений',
    create_permission: 'Создать разрешение',
    created: 'Разрешение для организации {{name}} успешно создано.',
  },
};

export default Object.freeze(organization_template);
