const error = {
  general_required: '{{types, list(type: disjunction;)}} is necessário',
  general_invalid: 'O {{types, list(type: disjunction;)}} é inválido',
  username_required: 'Utilizador necessário',
  password_required: 'Password necessária',
  username_exists: 'O nome de utilizador já existe',
  username_should_not_start_with_number: 'O nome de utilizador não deve começar com um número',
  username_invalid_charset:
    'O nome de utilizador deve conter apenas letras, números ou underscores.',
  invalid_email: 'O email é inválido',
  invalid_phone: 'O número de telefone é inválido',
  password_min_length: 'A password requer um mínimo de {{min}} caracteres',
  invalid_password:
    'A senha requer um mínimo de {{min}} caracteres e contém uma mistura de letras, números e símbolos.',
  passwords_do_not_match: 'As passwords não coincidem',
  invalid_passcode: 'O código de verificação é inválido.',
  invalid_connector_auth: 'A autorização é inválida',
  invalid_connector_request: 'Os dados do conector são inválidos',
  unknown: 'Erro desconhecido. Por favor, tente novamente mais tarde.',
  invalid_session: 'Sessão não encontrada. Volte e faça login novamente.',
  timeout: 'Tempo limite de sessão. Volte e faça login novamente.',
};

export default error;
