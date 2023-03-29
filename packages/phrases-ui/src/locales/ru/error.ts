const error = {
  general_required: 'Введите {{types, list(type: disjunction;)}}',
  general_invalid: 'Проверьте {{types, list(type: disjunction;)}}',
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
};
export default error;
