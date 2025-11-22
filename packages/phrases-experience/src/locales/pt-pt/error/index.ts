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
  invalid_email: 'O email é inválido',
  invalid_phone: 'O número de telefone é inválido',
  passwords_do_not_match: 'As passwords não coincidem',
  invalid_passcode: 'O código de verificação é inválido.',
  invalid_connector_auth: 'A autorização é inválida',
  invalid_connector_request: 'Os dados do conector são inválidos',
  unknown: 'Erro desconhecido. Por favor, tente novamente mais tarde.',
  invalid_session: 'Sessão não encontrada. Volte e faça login novamente.',
  timeout: 'Tempo limite de sessão. Volte e faça login novamente.',
  password_rejected,
  sso_not_enabled: 'O Single Sign-On não está habilitado para esta conta de e-mail.',
  invalid_link: 'Link inválido',
  invalid_link_description: 'O teu token de uso único pode ter expirado ou já não ser válido.',
  captcha_verification_failed: 'Falha na verificação do captcha.',
  terms_acceptance_required: 'Aceitação dos termos necessária',
  terms_acceptance_required_description:
    'Deves aceitar os termos para continuar. Por favor, tenta novamente.',
  something_went_wrong: 'Algo correu mal.',
  feature_not_enabled: 'Esta funcionalidade não está ativada.',
};

export default Object.freeze(error);
