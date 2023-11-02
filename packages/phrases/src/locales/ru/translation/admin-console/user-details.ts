const user_details = {
  page_title: 'Детали пользователя',
  back_to_users: 'Вернуться к управлению пользователями',
  created_title: 'Пользователь успешно создан',
  created_guide: 'Вот информация, которая поможет пользователю в процессе входа в систему.',
  created_email: 'Адрес электронной почты:',
  created_phone: 'Номер телефона:',
  created_username: 'Имя пользователя:',
  created_password: 'Пароль:',
  menu_delete: 'Удалить',
  delete_description: 'Это действие нельзя отменить. Оно окончательно удалит пользователя.',
  deleted: 'Пользователь успешно удален',
  reset_password: {
    reset_password: 'Сбросить пароль',
    title: 'Вы уверены, что хотите сбросить пароль?',
    content: 'Это действие нельзя отменить. Это сбросит информацию для входа пользователя.',
    congratulations: 'Пользователь был сброшен',
    new_password: 'Новый пароль:',
  },
  tab_settings: 'Настройки',
  tab_roles: 'Роли',
  tab_logs: 'Журналы пользователя',
  /** UNTRANSLATED */
  tab_organizations: 'Organizations',
  /** UNTRANSLATED */
  authentication: 'Authentication',
  authentication_description:
    'У каждого пользователя есть профиль, содержащий всю информацию о пользователе. Он состоит из основных данных, социальных идентификаторов и пользовательских данных.',
  /** UNTRANSLATED */
  user_profile: 'User profile',
  field_email: 'Адрес электронной почты',
  field_phone: 'Номер телефона',
  field_username: 'Имя пользователя',
  field_name: 'Имя',
  field_avatar: 'URL изображения аватара',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'Пользовательские данные',
  field_custom_data_tip:
    'Дополнительная информация о пользователе, не указанная в заранее определенных свойствах пользователя, таких как предпочтительный цвет и язык пользователя.',
  field_connectors: 'Социальные подключения',
  /** UNTRANSLATED */
  field_sso_connectors: 'Enterprise connections',
  custom_data_invalid: 'Пользовательские данные должны быть допустимым JSON-объектом',
  connectors: {
    connectors: 'Подключения',
    user_id: 'ID пользователя',
    remove: 'Удалить',
    /** UNTRANSLATED */
    connected: 'This user is connected with multiple social connectors.',
    not_connected: 'Пользователь не подключен к социальным подключениям',
    deletion_confirmation:
      'Вы удаляете существующую личность <name/>. Вы уверены, что хотите продолжить?',
  },
  sso_connectors: {
    /** UNTRANSLATED */
    connectors: 'Connectors',
    /** UNTRANSLATED */
    enterprise_id: 'Enterprise ID',
    /** UNTRANSLATED */
    connected:
      'This user is connected to multiple enterprise identity providers for Single Sign-On.',
    /** UNTRANSLATED */
    not_connected:
      'The user is not connected to any enterprise identity providers for Single Sign-On.',
  },
  mfa: {
    field_name: 'Двухфакторная аутентификация',
    field_description: 'Этот пользователь включил двухэтапные факторы аутентификации.',
    name_column: 'Двухфакторная аутентификация',
    field_description_empty: 'Этот пользователь не включил двухфакторную аутентификацию.',
    deletion_confirmation:
      'Вы удаляете существующий <name/> для двухэтапной верификации. Вы уверены, что хотите продолжить?',
  },
  suspended: 'Приостановлен',
  suspend_user: 'Приостановить пользователя',
  suspend_user_reminder:
    'Вы уверены, что хотите приостановить этого пользователя? Пользователь не сможет войти в ваше приложение, и он не сможет получить новый токен доступа после истечения срока действия текущего токена. Кроме того, любые API-запросы, сделанные этим пользователем, завершатся неудачей.',
  suspend_action: 'Приостановить',
  user_suspended: 'Пользователь был приостановлен.',
  reactivate_user: 'Возобновить пользователя',
  reactivate_user_reminder:
    'Вы уверены, что хотите возобновить этого пользователя? Это позволит любые попытки входа в систему для этого пользователя.',
  reactivate_action: 'Возобновить',
  user_reactivated: 'Пользователь был возобновлен.',
  roles: {
    name_column: 'Роль',
    description_column: 'Описание',
    assign_button: 'Назначить роли',
    delete_description:
      'Это действие удалит эту роль у данного пользователя. Роль все еще будет существовать, но она больше не будет связана с этим пользователем.',
    deleted: '{{name}} был(а) успешно удален(а) из этого пользователя.',
    assign_title: 'Назначить роли {{name}}',
    assign_subtitle: 'Авторизовать {{name}} в одной или нескольких ролях',
    assign_role_field: 'Назначить роли',
    role_search_placeholder: 'Поиск по названию роли',
    added_text: '{{value, number}} добавлен(а)',
    assigned_user_count: '{{value, number}} пользователей',
    confirm_assign: 'Назначить роли',
    role_assigned: 'Роль(и) успешно назначена(ы)',
    search: 'Поиск по названию роли, описанию или ID',
    empty: 'Нет доступных ролей',
  },
  warning_no_sign_in_identifier:
    'Пользователь должен иметь хотя бы один из идентификаторов входа (имя пользователя, электронная почта, номер телефона или социальная сеть), чтобы войти. Вы уверены, что хотите продолжить?',
  /** UNTRANSLATED */
  organization_roles_tooltip: 'The roles assigned to the user within this organization.',
};

export default Object.freeze(user_details);
