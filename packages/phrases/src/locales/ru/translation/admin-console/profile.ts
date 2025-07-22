const profile = {
  page_title: 'Настройки аккаунта',
  title: 'Настройки аккаунта',
  description:
    'Измените настройки своего аккаунта и управляйте своей личной информацией здесь, чтобы обеспечить безопасность своего аккаунта.',
  settings: {
    title: 'Настройки профиля',
    profile_information: 'Информация профиля',
    avatar: 'Аватар',
    name: 'Имя',
    username: 'Имя пользователя',
  },
  link_account: {
    title: 'СВЯЗАТЬ АККАУНТ',
    email_sign_in: 'Войти по электронной почте',
    email: 'Электронная почта',
    social_sign_in: 'Войти через социальные сети',
    link_email: 'Связать адрес электронной почты',
    link_email_subtitle:
      'Свяжите свою электронную почту для входа или помощи в восстановлении аккаунта.',
    email_required: 'Адрес электронной почты обязателен',
    invalid_email: 'Неправильный адрес электронной почты',
    identical_email_address: 'Введенный адрес электронной почты идентичен текущему',
    anonymous: 'Анонимный',
  },
  password: {
    title: 'ПАРОЛЬ И БЕЗОПАСНОСТЬ',
    password: 'Пароль',
    password_setting: 'Настройка пароля',
    new_password: 'Новый пароль',
    confirm_password: 'Подтвердите пароль',
    enter_password: 'Введите текущий пароль',
    enter_password_subtitle:
      'Для защиты безопасности вашей учетной записи подтвердите, что это вы. Пожалуйста, введите ваш текущий пароль перед изменением.',
    set_password: 'Установить пароль',
    verify_via_password: 'Проверить через пароль',
    show_password: 'Показать пароль',
    required: 'Пароль обязателен',
    do_not_match: 'Пароли не совпадают. Попробуйте еще раз.',
  },
  code: {
    enter_verification_code: 'Введите код подтверждения',
    enter_verification_code_subtitle:
      'Код подтверждения был отправлен на <strong>{{target}}</strong>',
    verify_via_code: 'Проверить через код подтверждения',
    resend: 'Повторно отправить код подтверждения',
    resend_countdown: 'Отправить повторно через {{countdown}} секунд',
  },
  delete_account: {
    title: 'УДАЛИТЬ АККАУНТ',
    label: 'Удалить аккаунт',
    description:
      'Удаление вашего аккаунта приведет к удалению всей вашей личной информации, пользовательских данных и конфигураций. Это действие нельзя будет отменить.',
    button: 'Удалить аккаунт',
    p: {
      has_issue:
        'Мы сожалеем, что вы хотите удалить свой аккаунт. Прежде чем вы сможете удалить свой аккаунт, вам нужно решить следующие проблемы.',
      after_resolved:
        'Как только вы решите проблемы, вы сможете удалить свой аккаунт. Пожалуйста, не стесняйтесь обращаться к нам, если вам нужна помощь.',
      check_information:
        'Мы сожалеем, что вы хотите удалить свой аккаунт. Пожалуйста, внимательно проверьте следующую информацию, прежде чем продолжить.',
      remove_all_data:
        'Удаление вашего аккаунта навсегда удалит все данные о вас в Logto Cloud. Пожалуйста, убедитесь, что у вас есть резервная копия всех важных данных перед продолжением.',
      confirm_information:
        'Пожалуйста, подтвердите, что информация выше соответствует вашим ожиданиям. После удаления вашего аккаунта мы не сможем его восстановить.',
      has_admin_role:
        'Поскольку у вас есть роль администратора в следующем арендаторе, он будет удален вместе с вашим аккаунтом:',
      has_admin_role_other:
        'Поскольку у вас есть роль администратора в следующих арендаторах, они будут удалены вместе с вашим аккаунтом:',
      quit_tenant: 'Вы собираетесь выйти из следующего арендатора:',
      quit_tenant_other: 'Вы собираетесь выйти из следующих арендаторов:',
    },
    issues: {
      paid_plan:
        'У следующего арендатора есть платный план, пожалуйста, сначала отмените подписку:',
      paid_plan_other:
        'У следующих арендаторов есть платные планы, пожалуйста, сначала отмените подписку:',
      subscription_status: 'У следующего арендатора есть проблема со статусом подписки:',
      subscription_status_other: 'У следующих арендаторов есть проблемы со статусом подписки:',
      open_invoice: 'У следующего арендатора есть неоплаченный счет:',
      open_invoice_other: 'У следующих арендаторов есть неоплаченные счета:',
    },
    error_occurred: 'Произошла ошибка',
    error_occurred_description: 'Извините, произошла ошибка при удалении вашего аккаунта:',
    request_id: 'Request ID: {{requestId}}',
    try_again_later:
      'Пожалуйста, попробуйте позже. Если проблема сохраняется, пожалуйста, свяжитесь с командой Logto с использованием Request ID.',
    final_confirmation: 'Окончательное подтверждение',
    about_to_start_deletion:
      'Вы собираетесь начать процесс удаления, и это действие нельзя будет отменить.',
    permanently_delete: 'Удалить навсегда',
  },
  set: 'Установить',
  change: 'Изменить',
  link: 'Связать',
  unlink: 'Разъединить',
  not_set: 'Не установлено',
  change_avatar: 'Изменить аватар',
  change_name: 'Изменить имя',
  change_username: 'Изменить имя пользователя',
  set_name: 'Установить имя',
  email_changed: 'Адрес электронной почты изменен.',
  password_changed: 'Пароль изменен.',
  updated: '{{target}} обновлен.',
  linked: '{{target}} связан.',
  unlinked: '{{target}} разъединен.',
  email_exists_reminder:
    'Этот адрес электронной почты {{email}} связан с существующим аккаунтом. Свяжите другой адрес электронной почты здесь.',
  unlink_confirm_text: 'Да, разъединить',
  unlink_reminder:
    'Пользователи не смогут войти в аккаунт с помощью <span></span> , если вы его отсоедините. Вы уверены, что хотите продолжить?',
  fields: {
    /** UNTRANSLATED */
    name: 'Name',
    /** UNTRANSLATED */
    avatar: 'Avatar',
    /** UNTRANSLATED */
    familyName: 'Family name',
    /** UNTRANSLATED */
    givenName: 'Given name',
    /** UNTRANSLATED */
    middleName: 'Middle name',
    /** UNTRANSLATED */
    nickname: 'Nickname',
    /** UNTRANSLATED */
    preferredUsername: 'Preferred username',
    /** UNTRANSLATED */
    profile: 'Profile',
    /** UNTRANSLATED */
    website: 'Website',
    /** UNTRANSLATED */
    gender: 'Gender',
    /** UNTRANSLATED */
    birthdate: 'Birthdate',
    /** UNTRANSLATED */
    zoneinfo: 'Timezone',
    /** UNTRANSLATED */
    locale: 'Language',
    address: {
      /** UNTRANSLATED */
      formatted: 'Address',
      /** UNTRANSLATED */
      streetAddress: 'Street address',
      /** UNTRANSLATED */
      locality: 'City',
      /** UNTRANSLATED */
      region: 'State',
      /** UNTRANSLATED */
      postalCode: 'Zip code',
      /** UNTRANSLATED */
      country: 'Country',
    },
  },
};

export default Object.freeze(profile);
