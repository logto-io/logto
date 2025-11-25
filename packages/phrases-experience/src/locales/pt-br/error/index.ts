import password_rejected from './password-rejected.js';

const error = {
  general_required: '{{types, list(type: disjunction;)}} é obrigatório',
  general_invalid: 'O {{types, list(type: disjunction;)}} é inválido',
  invalid_min_max_input: 'O valor de entrada deve estar entre {{minValue}} e {{maxValue}}',
  invalid_min_max_length:
    'O comprimento do valor de entrada deve estar entre {{minLength}} e {{maxLength}}',
  username_required: 'Nome de usuário é obrigatório',
  password_required: 'Senha é obrigatório',
  username_exists: 'O nome de usuário já existe',
  username_should_not_start_with_number: 'O nome de usuário não deve começar com um número',
  username_invalid_charset: 'O nome de usuário deve conter apenas letras, números ou sublinhados.',
  invalid_email: 'O e-mail é inválido',
  invalid_phone: 'O número de telefone é inválido',
  passwords_do_not_match: 'Suas senhas não correspondem. Por favor, tente novamente.',
  invalid_passcode: 'O código de verificação é inválido.',
  invalid_connector_auth: 'A autorização é inválida',
  invalid_connector_request: 'Os dados do conector são inválidos',
  unknown: 'Erro desconhecido. Por favor, tente novamente mais tarde.',
  invalid_session: 'Sessão não encontrada. Volte e faça login novamente.',
  timeout: 'Tempo limite excedido. Por favor, tente novamente mais tarde.',
  password_rejected,
  sso_not_enabled: 'O Single Sign-On não está habilitado para esta conta de e-mail.',
  invalid_link: 'Link inválido',
  invalid_link_description: 'Seu token de uso único pode ter expirado ou não é mais válido.',
  captcha_verification_failed: 'Falha na verificação do captcha.',
  terms_acceptance_required: 'Aceitação dos termos obrigatória',
  terms_acceptance_required_description:
    'Você deve aceitar os termos para continuar. Por favor, tente novamente.',
  something_went_wrong: 'Algo deu errado.',
  feature_not_enabled: 'Este recurso não está habilitado.',
};

export default Object.freeze(error);
