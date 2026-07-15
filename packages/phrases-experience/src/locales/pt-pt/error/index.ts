import password_rejected from './password-rejected.js';

const error = {
  general_required: '{{types, list(type: disjunction;)}} is necessário',
  general_invalid: 'O {{types, list(type: disjunction;)}} é inválido',
  invalid_min_max_input: 'O valor de entrada deve estar entre {{minValue}} e {{maxValue}}',
  invalid_min_max_length:
    'O comprimento do valor de entrada deve estar entre {{minLength}} e {{maxLength}}',
  username_required: 'Utilizador necessário',
  password_required: 'Password necessária',
  username_exists: 'O nome de utilizador já existe',
  username_should_not_start_with_number: 'O nome de utilizador não deve começar com um número',
  username_invalid_charset:
    'O nome de utilizador deve conter apenas letras, números ou underscores.',
  username_too_short: 'O nome de utilizador deve ter pelo menos {{min}} caracteres.',
  username_too_long: 'O nome de utilizador deve ter, no máximo, {{max}} caracteres.',
  username_uppercase_not_allowed: 'Letras maiúsculas não são permitidas nos nomes de utilizador.',
  username_lowercase_not_allowed: 'Letras minúsculas não são permitidas nos nomes de utilizador.',
  username_numbers_not_allowed: 'Números não são permitidos nos nomes de utilizador.',
  username_underscore_not_allowed: 'Underscores não são permitidos nos nomes de utilizador.',
  invalid_email: 'O email é inválido',
  invalid_phone: 'O número de telefone é inválido',
  passwords_do_not_match: 'As passwords não coincidem',
  invalid_passcode: 'O código de verificação é inválido.',
  device_code_required: 'O código é necessário.',
  invalid_device_code: 'O código do dispositivo é inválido.',
  device_flow_aborted: 'O pedido de início de sessão foi interrompido.',
  invalid_connector_auth: 'A autorização é inválida',
  invalid_connector_request: 'Os dados do conector são inválidos',
  unknown: 'Erro desconhecido.',
  invalid_session: 'Sessão não encontrada. Volte e faça login novamente.',
  timeout: 'Tempo limite de sessão. Volte e faça login novamente.',
  password_rejected,
  sso_not_enabled: 'O Single Sign-On não está habilitado para esta conta de e-mail.',
  invalid_link: 'Link inválido',
  invalid_link_description: 'O teu token de uso único pode ter expirado ou já não ser válido.',
  captcha_verification_failed: 'Falha na verificação do captcha.',
  send_verification_code_failed:
    'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
  send_verification_code_failed_use_password:
    'Falha ao enviar o código de verificação. Em vez disso, inicie sessão com a sua palavra-passe.',
  terms_acceptance_required: 'Aceitação dos termos necessária',
  terms_acceptance_required_description:
    'Deves aceitar os termos para continuar. Por favor, tenta novamente.',
  something_went_wrong: 'Algo correu mal',
  account_suspended: 'Conta suspensa',
  account_suspended_description:
    'Esta conta foi suspensa. Contacte o administrador para obter assistência.',
  access_denied: 'Acesso negado',
  application_access_denied:
    'Não tem permissão para aceder a esta aplicação.\nPor favor, contacte o seu administrador para obter ajuda.',
  feature_not_enabled:
    'Não tem permissão para aceder a esta funcionalidade. Por favor, contacte o seu administrador para obter ajuda.',
};

export default Object.freeze(error);
