const description = {
  email: 'адрес электронной почты',
  phone_number: 'номер телефона',
  username: 'имя пользователя',
  reminder: 'Напоминание',
  not_found: '404 Не найдено',
  agree_with_terms: 'Я прочитал и согласен с ',
  agree_with_terms_modal: 'Чтобы продолжить, пожалуйста, согласитесь с <link></link>',
  terms_of_use: 'Условиями использования',
  sign_in: 'Войти',
  privacy_policy: 'Политикой конфиденциальности',
  create_account: 'Создать аккаунт',
  switch_account: 'Сменить аккаунт',
  or: 'или',
  and: 'и',
  enter_passcode: 'Код подтверждения был отправлен на {{address}}',
  passcode_sent: 'Код подтверждения был отправлен повторно',
  resend_after_seconds: 'Еще не получили? Отправить повторно через <span>{{seconds}}</span> секунд',
  resend_passcode: 'Еще не получили? <a>Отправить повторно код подтверждения</a>',
  create_account_id_exists: 'Учетная запись для {{value}} уже существует, хотите войти?',
  link_account_id_exists: 'Учетная запись для {{value}} уже существует, хотите привязать?',
  sign_in_id_does_not_exist:
    'Учетная запись для {{value}} не существует, хотите зарегистрироваться?',
  sign_in_id_does_not_exist_alert: 'Учетная запись для {{value}} не существует.',
  create_account_id_exists_alert:
    'Аккаунт с {{type}} {{value}} связан с другим аккаунтом. Пожалуйста, попробуйте другой {{type}}.',
  social_identity_exist:
    '{{type}} {{value}} связан с другим аккаунтом. Пожалуйста, попробуйте другой {{type}}.',
  bind_account_title: 'Привязать или создать аккаунт',
  social_create_account: 'Вы можете создать новую учетную запись.',
  social_link_email: 'Вы можете привязать другой адрес электронной почты',
  social_link_phone: 'Вы можете привязать другой номер телефона',
  social_link_email_or_phone: 'Вы можете привязать другой адрес электронной почты или телефон',
  social_bind_with_existing:
    'Мы нашли связанный аккаунт, который был зарегистрирован, и вы можете связать его напрямую.',
  skip_social_linking: 'Пропустить привязку к существующему аккаунту?',
  reset_password: 'Забыли пароль',
  reset_password_description:
    'Введите {{types, list(type: disjunction;)}} от вашей учетной записи, и мы вышлем вам код для восстановления пароля.',
  new_password: 'Новый пароль',
  set_password: 'Задать пароль',
  password_changed: 'Пароль изменен',
  no_account: 'Еще не зарегистрированы? ',
  have_account: 'Уже есть аккаунт?',
  enter_password: 'Введите пароль',
  enter_password_for: 'Введите пароль для {{value}}',
  enter_username: 'Установить имя пользователя',
  enter_username_description:
    'Имя пользователя является альтернативой для входа в систему. Имя пользователя должно содержать только буквы, цифры и символы подчеркивания.',
  link_email: 'Привязать почту',
  link_phone: 'Привязать номер телефона',
  link_email_or_phone: 'Привязать почту или номер телефона',
  link_email_description:
    'Для дополнительной безопасности, пожалуйста, привяжите свою электронную почту к учетной записи.',
  link_phone_description:
    'Для дополнительной безопасности, пожалуйста, привяжите свой номер телефона к учетной записи.',
  link_email_or_phone_description:
    'Для дополнительной безопасности, пожалуйста, привяжите свою электронную почту или номер телефона к учетной записи.',
  continue_with_more_information:
    'Для дополнительной безопасности, пожалуйста, заполните приведенные ниже данные учетной записи.',
  create_your_account: 'Создайте свой аккаунт',
  sign_in_to_your_account: 'Войди в свой аккаунт',
  no_region_code_found: 'Не удалось определить код региона',
  verify_email: 'Подтвердите Ваш электронный адрес',
  verify_phone: 'Подтвердите свой номер телефона',
  password_requirements: 'Требования к паролю {{items, list}}.',
  password_requirement: {
    length_one: 'требуется минимум {{count}} символ',
    length_two: 'требуется минимум {{count}} символа',
    length_few: 'требуется минимум {{count}} символа',
    length_many: 'требуется минимум {{count}} символов',
    length_other: 'требуется минимум {{count}} символов',
    character_types_one:
      'должен содержать по крайней мере {{count}} тип прописных букв, строчных букв, цифр и символов',
    character_types_two:
      'должен содержать по крайней мере {{count}} типа прописных букв, строчных букв, цифр и символов',
    character_types_few:
      'должен содержать по крайней мере {{count}} типа прописных букв, строчных букв, цифр и символов',
    character_types_many:
      'должен содержать по крайней мере {{count}} типов прописных букв, строчных букв, цифр и символов',
    character_types_other:
      'должен содержать по крайней мере {{count}} типа прописных букв, строчных букв, цифр и символов',
  },
  use: 'Использовать',
  single_sign_on_email_form: 'Введите корпоративный адрес электронной почты',
  single_sign_on_connectors_list:
    'Ваше предприятие включило функцию единого входа для электронной почты {{email}}. Вы можете продолжить вход в систему с помощью следующих провайдеров SSO.',
  single_sign_on_enabled: 'Единый вход в систему включен для этой учетной записи',
  authorize_title: 'Авторизовать {{name}}',
  request_permission: '{{name}} запрашивает доступ к:',
  grant_organization_access: 'Предоставить доступ организации:',
  authorize_personal_data_usage: 'Авторизовать использование ваших личных данных:',
  authorize_organization_access: 'Авторизовать доступ к конкретной организации:',
  user_scopes: 'Личные данные пользователя',
  organization_scopes: 'Доступ к организации',
  authorize_agreement: `Авторизуя доступ, вы соглашаетесь с <link></link> {{name}}.`,
  authorize_agreement_with_redirect: `Авторизуя доступ, вы соглашаетесь с <link></link> {{name}}, и будете перенаправлены на {{uri}}.`,
  not_you: 'Это не вы?',
  user_id: 'ID пользователя: {{id}}',
  redirect_to: 'Вы будете перенаправлены на {{name}}.',
  auto_agreement: 'Продолжая, вы соглашаетесь с <link></link>.',
  identifier_sign_in_description: 'Введите свои {{types, list(type: disjunction;)}} для входа.',
  all_sign_in_options: 'Все варианты входа',
  identifier_register_description:
    'Введите свои {{types, list(type: disjunction;)}} чтобы создать новую учётную запись.',
  all_account_creation_options: 'Все варианты создания учётной записи',
  back_to_sign_in: 'Вернуться ко входу',
  support_email: 'Поддержка по электронной почте: <link></link>',
  support_website: 'Сайт поддержки: <link></link>',
  switch_account_title: 'В настоящее время вы вошли как {{account}}',
  switch_account_description:
    'Чтобы продолжить, вы будете выйти из текущей учетной записи и автоматически переключены на новую учетную запись.',
};

export default Object.freeze(description);
