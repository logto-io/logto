const errors = {
  something_went_wrong: 'Ops! Algo deu errado.',
  page_not_found: 'Página não encontrada',
  unknown_server_error: 'Ocorreu um erro desconhecido no servidor',
  empty: 'Sem dados',
  missing_total_number: 'Não foi possível encontrar Total-Number nos cabeçalhos de resposta',
  invalid_uri_format: 'Formato de URI inválido',
  invalid_origin_format: 'Formato de origem de URI inválido',
  invalid_json_format: 'Formato JSON inválido',
  invalid_error_message_format: 'O formato da mensagem de erro é inválido.',
  required_field_missing: 'Por favor, insira {{field}}',
  required_field_missing_plural: 'Você deve inserir pelo menos um {{field}}',
  more_details: 'Mais detalhes',
  username_pattern_error:
    'O nome de usuário deve conter apenas letras, números ou sublinhado e não deve começar com um número.',
  password_pattern_error:
    'A senha requer um mínimo de {{min}} caracteres e contém uma mistura de letras, números e símbolos.',
  email_pattern_error: 'O endereço de e-mail é inválido.',
  phone_pattern_error: 'O número de telefone é inválido.',
  insecure_contexts: 'Contextos inseguros (não-HTTPS) não são suportados.',
  unexpected_error: 'Um erro inesperado ocorreu',
  not_found: '404 não encontrado',
  create_internal_role_violation:
    'Você está criando uma nova função interna que é proibida pela Logto. Tente outro nome que não comece com "#internal:".',
};

export default errors;
