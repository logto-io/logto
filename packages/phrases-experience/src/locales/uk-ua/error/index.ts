import password_rejected from './password-rejected.js';

const error = {
  general_required: 'Необхідно вказати {{types, list(type: disjunction;)}}',
  general_invalid: '{{types, list(type: disjunction;)}} є недійсним',
  invalid_min_max_input: 'Значення повинно бути між {{minValue}} і {{maxValue}}',
  invalid_min_max_length: 'Довжина значення повинна бути між {{minLength}} і {{maxLength}}',
  username_required: "Ім'я користувача є обов'язковим",
  password_required: "Пароль є обов'язковим",
  username_exists: "Таке ім'я користувача вже існує",
  username_should_not_start_with_number: "Ім'я користувача не повинно починатися з цифри",
  username_invalid_charset: "Ім'я користувача може містити лише літери, цифри та підкреслення.",
  invalid_email: 'Недійсна електронна пошта',
  invalid_phone: 'Недійсний номер телефону',
  passwords_do_not_match: 'Паролі не збігаються. Будь ласка, спробуйте ще раз.',
  invalid_passcode: 'Недійсний код підтвердження.',
  invalid_connector_auth: 'Недійсна авторизація',
  invalid_connector_request: 'Недійсні дані конектора',
  unknown: 'Невідома помилка. Будь ласка, спробуйте пізніше.',
  invalid_session: 'Сесію не знайдено. Будь ласка, поверніться назад і увійдіть знову.',
  timeout: 'Час очікування вийшов. Будь ласка, спробуйте ще раз пізніше.',
  password_rejected,
  sso_not_enabled: 'Єдиний вхід (SSO) не ввімкнено для цього облікового запису.',
  invalid_link: 'Недійсне посилання',
  invalid_link_description: 'Ваш одноразовий токен міг спливти або більше не є дійсним.',
  captcha_verification_failed: 'Не вдалося пройти перевірку капчі.',
  terms_acceptance_required: 'Потрібно прийняти умови',
  terms_acceptance_required_description:
    'Ви повинні погодитися з умовами, щоб продовжити. Будь ласка, спробуйте ще раз.',
  something_went_wrong: 'Щось пішло не так.',
  feature_not_enabled: 'Ця функція не увімкнена.',
};

export default Object.freeze(error);
