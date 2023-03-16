import type { LocalePhrase } from '../types.js';

const translation = {
  input: {
    username: 'Имя пользователя',
    password: 'Пароль',
    email: 'Электронная почта',
    phone_number: 'Номер телефона',
    confirm_password: 'Подтверждение пароля',
    search_region_code: 'Поиск кода региона',
  },
  secondary: {
    social_bind_with:
      'Уже есть аккаунт? Войдите, чтобы привязать {{methods, list(type: disjunction;)}}.',
  },
  action: {
    sign_in: 'Войти',
    continue: 'Продолжить',
    create_account: 'Создать аккаунт',
    create_account_without_linking: 'Создать аккаунт без связывания',
    create: 'Создать',
    enter_passcode: 'Введите код подтверждения',
    confirm: 'Подтвердить',
    cancel: 'Отменить',
    save_password: 'Сохраните пароль',
    bind: 'Привязать к {{address}}',
    bind_and_continue: 'Привязать и продолжить',
    back: 'Назад',
    nav_back: 'Назад',
    agree: 'Согласен',
    got_it: 'Понял',
    sign_in_with: 'Войти через {{name}}',
    forgot_password: 'Забыли пароль?',
    switch_to: 'Изменить на {{method}}',
    sign_in_via_passcode: 'Войти с кодом подтверждения',
    sign_in_via_password: 'Войти с паролем',
    change: 'Изменить {{method}}',
    link_another_email: 'Привязать другую почту',
    link_another_phone: 'Привязать другой номер',
    link_another_email_or_phone: 'Привязать другую почту или номер',
    show_password: 'Показать пароль',
  },
  description: {
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
    welcome_to_sign_in: 'Добро пожаловать для входа в систему',
  },
  error: {
    general_required: `Введите {{types, list(type: disjunction;)}}`,
    general_invalid: `Проверьте {{types, list(type: disjunction;)}}`,
    username_required: 'Введите имя пользователя',
    password_required: 'Введите пароль',
    username_exists: 'Имя пользователя занято',
    username_should_not_start_with_number: 'Имя пользователя не должно начинаться с цифры',
    username_invalid_charset:
      'Имя пользователя должно содержать только буквы, цифры или символы подчеркивания',
    invalid_email: 'Электронная почта указана неправильно',
    invalid_phone: 'Номер телефона указан неправильно',
    password_min_length: 'Пароль должен быть минимум {{min}} символов',
    passwords_do_not_match: 'Пароли не совпадают. Пожалуйста, попробуйте еще раз.',
    invalid_password:
      'Пароль должен содержать минимум {{min}} символов, включая буквы, цифры и символы.',
    invalid_passcode: 'Неправильный код подтверждения',
    invalid_connector_auth: 'Авторизация недействительна',
    invalid_connector_request: 'Данные коннектора недействительны.',
    unknown: 'Неизвестная ошибка. Пожалуйста, повторите попытку позднее.',
    invalid_session: 'Сессия не найдена. Пожалуйста, войдите снова.',
    timeout: 'Время ожидания истекло. Пожалуйста, повторите попытку позднее.',
  },
  demo_app: {
    notification: 'Совет: Создайте аккаунт сначала, чтобы протестировать процесс входа.',
  },
};

const ru: LocalePhrase = Object.freeze({
  translation,
});

export default ru;
