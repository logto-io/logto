import password_rejected from './password-rejected.js';

const error = {
  general_required: 'Введите {{types, list(type: disjunction;)}}',
  general_invalid: 'Проверьте {{types, list(type: disjunction;)}}',
  invalid_min_max_input: 'Значение должно быть между {{minValue}} и {{maxValue}}',
  invalid_min_max_length: 'Длина значения должна быть между {{minLength}} и {{maxLength}}',
  username_required: 'Введите имя пользователя',
  password_required: 'Введите пароль',
  username_exists: 'Имя пользователя занято',
  username_should_not_start_with_number: 'Имя пользователя не должно начинаться с цифры',
  username_invalid_charset:
    'Имя пользователя должно содержать только буквы, цифры или символы подчеркивания',
  invalid_email: 'Электронная почта указана неправильно',
  invalid_phone: 'Номер телефона указан неправильно',
  passwords_do_not_match: 'Пароли не совпадают. Пожалуйста, попробуйте еще раз.',
  invalid_passcode: 'Неправильный код подтверждения.',
  invalid_connector_auth: 'Авторизация недействительна',
  invalid_connector_request: 'Данные коннектора недействительны.',
  unknown: 'Неизвестная ошибка. Пожалуйста, повторите попытку позднее.',
  invalid_session: 'Сессия не найдена. Пожалуйста, войдите снова.',
  timeout: 'Время ожидания истекло. Пожалуйста, повторите попытку позднее.',
  password_rejected,
  sso_not_enabled: 'Односторонняя авторизация не включена для этого аккаунта электронной почты.',
  invalid_link: 'Неверная ссылка',
  invalid_link_description:
    'Ваш одноразовый токен мог истечь или больше не является действительным.',
  captcha_verification_failed: 'Не удалось проверить капчу.',
  terms_acceptance_required: 'Требуется согласие с условиями',
  terms_acceptance_required_description:
    'Вы должны согласиться с условиями, чтобы продолжить. Пожалуйста, попробуйте снова.',
  something_went_wrong: 'Что-то пошло не так.',
  feature_not_enabled: 'Эта функция не включена.',
};

export default Object.freeze(error);
