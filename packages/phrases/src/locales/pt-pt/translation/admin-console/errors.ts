const errors = {
  something_went_wrong: 'Ops! Algo deu errado.',
  page_not_found: 'Página não encontrada',
  unknown_server_error: 'Ocorreu um erro de servidor desconhecido',
  empty: 'Sem dados',
  missing_total_number: 'Não foi possível encontrar `Total-Number` nos cabeçalhos da resposta',
  invalid_uri_format: 'Formato de URI inválido',
  invalid_origin_format: 'Formato de origem de URI inválido',
  invalid_json_format: 'Formato JSON inválido',
  invalid_regex: 'Expressão regular inválida',
  invalid_error_message_format: 'O formato da mensagem de erro é inválido.',
  required_field_missing: 'Por favor, introduza {{field}}',
  required_field_missing_plural: 'Deve inserir pelo menos um {{field}}',
  more_details: 'Mais detalhes',
  username_pattern_error:
    'O nome de utilizador deve conter apenas letras, números ou underscores e não deve começar com um número.',
  email_pattern_error: 'O endereço de e-mail é inválido.',
  phone_pattern_error: 'O número de telefone é inválido.',
  insecure_contexts: 'Contextos inseguros (não HTTPS) não são compatíveis.',
  unexpected_error: 'Ocorreu um erro inesperado',
  not_found: '404 página não encontrada',
  create_internal_role_violation:
    'Está a criar uma nova função interna que é proibida pelo Logto. Tente outro nome que não comece com "#internal:".',
  should_be_an_integer: 'Deve ser um inteiro.',
  number_should_be_between_inclusive:
    'Então o número deve estar entre {{min}} e {{max}} (ambos inclusivos).',
};

export default Object.freeze(errors);
