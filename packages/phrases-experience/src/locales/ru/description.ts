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
  or: 'или',
  and: 'и',
  enter_passcode: 'Код подтверждения был отправлен на {{address}}',
  passcode_sent: 'Код подтверждения был отправлен повторно',
  resend_after_seconds: 'Отправить повторно через <span>{{seconds}}</span> сек.',
  resend_passcode: 'Отправить повторно',
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
    'Мы находим зарегистрированную связанную учетную запись, и вы можете связать ее напрямую.',
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
    length_other: 'требуется минимум {{count}} символов',
    character_types_one:
      'должен содержать по крайней мере {{count}} тип прописных букв, строчных букв, цифр и символов',
    character_types_other:
      'должен содержать по крайней мере {{count}} типа прописных букв, строчных букв, цифр и символов',
  },
  use: 'Использовать',
  single_sign_on_email_form: 'Введите корпоративный адрес электронной почты',
  single_sign_on_connectors_list:
    'Ваше предприятие включило функцию единого входа для электронной почты {{email}}. Вы можете продолжить вход в систему с помощью следующих провайдеров SSO.',
  single_sign_on_enabled: 'Единый вход в систему включен для этой учетной записи',
  /** UNTRANSLATED */
  authorize_title: 'Authorize {{name}}',
  /** UNTRANSLATED */
  request_permission: '{{name}} is requesting access to:',
  /** UNTRANSLATED */
  grant_organization_access: 'Grant the organization access:',
  /** UNTRANSLATED */
  authorize_personal_data_usage: 'Authorize the use of your personal data:',
  /** UNTRANSLATED */
  authorize_organization_access: 'Authorize access to the specific organization:',
  /** UNTRANSLATED */
  user_scopes: 'Personal user data',
  /** UNTRANSLATED */
  organization_scopes: 'Organization access',
  /** UNTRANSLATED */
  authorize_agreement: `By authorizing the access, you agree to the {{name}}'s <link></link>.`,
  /** UNTRANSLATED */
  authorize_agreement_with_redirect: `By authorizing the access, you agree to the {{name}}'s <link></link>, and will be redirected to {{uri}}.`,
  /** UNTRANSLATED */
  not_you: 'Not you?',
  /** UNTRANSLATED */
  user_id: 'User ID: {{id}}',
  /** UNTRANSLATED */
  redirect_to: 'You will be redirected to {{name}}.',
};

export default Object.freeze(description);
