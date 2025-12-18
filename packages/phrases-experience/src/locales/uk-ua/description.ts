const description = {
  email: 'електронна пошта',
  phone_number: 'номер телефону',
  username: "ім'я користувача",
  reminder: 'Нагадування',
  not_found: '404 Не знайдено',
  agree_with_terms: 'Я прочитав(ла) і погоджуюся з ',
  agree_with_terms_modal: 'Щоб продовжити, будь ласка, погодьтеся з <link></link>.',
  terms_of_use: 'Умовами використання',
  sign_in: 'Увійти',
  privacy_policy: 'Політикою конфіденційності',
  create_account: 'Створити обліковий запис',
  switch_account: 'Змінити обліковий запис',
  or: 'або',
  and: 'та',
  enter_passcode: 'Код підтвердження було надіслано на {{address}} {{target}}',
  passcode_sent: 'Код підтвердження було повторно надіслано',
  resend_after_seconds: 'Не отримали код? Повторна відправка через <span>{{seconds}}</span> секунд',
  resend_passcode: 'Не отримали код? <a>Надіслати повторно</a>',
  create_account_id_exists: 'Обліковий запис {{value}} вже існує. Продовжити вхід.',
  link_account_id_exists: "Обліковий запис з {{type}} {{value}} вже існує. Бажаєте зв'язати?",
  sign_in_id_does_not_exist: 'Обліковий запис для {{value}} не знайдено. Створити новий?',
  sign_in_id_does_not_exist_alert: 'Обліковий запис з {{type}} {{value}} не існує.',
  create_account_id_exists_alert:
    'Обліковий запис з {{type}} {{value}} пов’язаний з іншим обліковим записом. Будь ласка, спробуйте інший {{type}}.',
  social_identity_exist:
    '{{type}} {{value}} пов’язаний з іншим обліковим записом. Будь ласка, спробуйте інший {{type}}.',
  bind_account_title: 'Зв’язати або створити обліковий запис',
  social_create_account: 'Ви можете створити новий обліковий запис.',
  social_link_email: 'Ви можете зв’язати іншу електронну пошту',
  social_link_phone: 'Ви можете зв’язати інший телефон',
  social_link_email_or_phone: 'Ви можете зв’язати іншу електронну пошту або телефон',
  social_bind_with_existing:
    'Ми знайшли відповідний обліковий запис, який уже зареєстровано. Ви можете зв’язати його безпосередньо.',
  skip_social_linking: 'Пропустити зв’язування з існуючим обліковим записом?',
  reset_password: 'Скинути пароль',
  reset_password_description:
    'Введіть {{types, list(type: disjunction;)}}, пов’язаний з вашим обліковим записом, і ми надішлемо вам код підтвердження для скидання пароля.',
  new_password: 'Новий пароль',
  set_password: 'Встановити пароль',
  password_changed: 'Пароль змінено',
  no_account: 'Ще не маєте облікового запису?',
  have_account: 'Вже маєте обліковий запис?',
  enter_password: 'Введіть пароль',
  enter_password_for: 'Увійдіть за допомогою пароля до {{method}} {{value}}',
  enter_username: 'Встановити ім’я користувача',
  enter_username_description:
    'Ім’я користувача є альтернативою для входу. Воно має містити лише літери, цифри та підкреслення.',
  link_email: 'Зв’язати електронну пошту',
  link_phone: 'Зв’язати телефон',
  link_email_or_phone: 'Зв’язати електронну пошту або телефон',
  link_email_description:
    'Для додаткової безпеки, будь ласка, зв’яжіть вашу електронну пошту з обліковим записом.',
  link_phone_description:
    'Для додаткової безпеки, будь ласка, зв’яжіть ваш телефон з обліковим записом.',
  link_email_or_phone_description:
    'Для додаткової безпеки, будь ласка, зв’яжіть вашу електронну пошту або телефон з обліковим записом.',
  continue_with_more_information:
    'Для додаткової безпеки, будь ласка, заповніть наведені нижче дані облікового запису.',
  create_your_account: 'Створіть свій обліковий запис',
  sign_in_to_your_account: 'Увійдіть до свого облікового запису',
  no_region_code_found: 'Код регіону не знайдено',
  verify_email: 'Підтвердіть вашу електронну пошту',
  verify_phone: 'Підтвердіть ваш номер телефону',
  password_requirements: 'Пароль {{items, list}}.',
  password_requirement: {
    length_one: 'має містити щонайменше {{count}} символ',
    length_two: 'має містити щонайменше {{count}} символи',
    length_few: 'має містити щонайменше {{count}} символів',
    length_many: 'має містити щонайменше {{count}} символів',
    length_other: 'має містити щонайменше {{count}} символів',
    character_types_one:
      'має містити щонайменше {{count}} тип символів: великі літери, малі літери, цифри та спеціальні символи',
    character_types_two:
      'має містити щонайменше {{count}} типи символів: великі літери, малі літери, цифри та спеціальні символи',
    character_types_few:
      'має містити щонайменше {{count}} типів символів: великі літери, малі літери, цифри та спеціальні символи',
    character_types_many:
      'має містити щонайменше {{count}} типів символів: великі літери, малі літери, цифри та спеціальні символи',
    character_types_other:
      'має містити щонайменше {{count}} типів символів: великі літери, малі літери, цифри та спеціальні символи',
  },
  use: 'Використовувати',
  single_sign_on_email_form: 'Введіть вашу корпоративну електронну адресу',
  single_sign_on_connectors_list:
    'Ваше підприємство увімкнуло єдиний вхід (SSO) для електронної пошти {{email}}. Ви можете продовжити вхід за допомогою таких постачальників SSO.',
  single_sign_on_enabled: 'Єдиний вхід (SSO) увімкнено для цього облікового запису',
  authorize_title: 'Авторизувати {{name}}',
  request_permission: '{{name}} запитує доступ до:',
  grant_organization_access: 'Надати доступ організації:',
  authorize_personal_data_usage: 'Дозволити використання ваших персональних даних:',
  authorize_organization_access: 'Дозволити доступ до конкретної організації:',
  user_scopes: 'Персональні дані користувача',
  organization_scopes: 'Доступ до організації',
  authorize_agreement: 'Авторизуючи доступ, ви погоджуєтесь з <link></link> {{name}}.',
  authorize_agreement_with_redirect:
    'Авторизуючи доступ, ви погоджуєтесь з <link></link> {{name}}, і вас буде перенаправлено на {{uri}}.',
  not_you: 'Це не ви?',
  user_id: 'Ідентифікатор користувача: {{id}}',
  redirect_to: 'Вас буде перенаправлено на {{name}}.',
  auto_agreement: 'Продовжуючи, ви погоджуєтесь з <link></link>.',
  identifier_sign_in_description: 'Введіть {{types, list(type: disjunction;)}} для входу.',
  all_sign_in_options: 'Усі варіанти входу',
  identifier_register_description:
    'Введіть {{types, list(type: disjunction;)}} для створення нового облікового запису.',
  all_account_creation_options: 'Усі варіанти створення облікового запису',
  back_to_sign_in: 'Повернутися до входу',
  support_email: 'Електронна пошта підтримки: <link></link>',
  support_website: 'Вебсайт підтримки: <link></link>',
  switch_account_title: 'Ви ввійшли як {{account}}',
  switch_account_description:
    'Щоб продовжити, ви будете вийдені з поточного облікового запису та автоматично переключені на новий.',
  about_yourself: 'Розкажіть про себе',
};

export default Object.freeze(description);
