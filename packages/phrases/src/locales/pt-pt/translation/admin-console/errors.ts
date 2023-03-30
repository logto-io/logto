const errors = {
  something_went_wrong: 'Ops! Algo deu errado.',
  page_not_found: 'Página não encontrada',
  unknown_server_error: 'Ocorreu um erro de servidor desconhecido',
  empty: 'Sem dados',
  missing_total_number: 'Não foi possível encontrar `Total-Number` nos cabeçalhos da resposta',
  invalid_uri_format: 'Formato de URI inválido',
  invalid_origin_format: 'Formato de origem de URI inválido',
  invalid_json_format: 'Formato JSON inválido',
  invalid_error_message_format: 'O formato da mensagem de erro é inválido.',
  required_field_missing: 'Por favor, introduza {{field}}',
  required_field_missing_plural: 'Deve inserir pelo menos um {{field}}',
  more_details: 'Mais detalhes',
  username_pattern_error:
    'O nome de utilizador deve conter apenas letras, números ou underscores e não deve começar com um número.',
  password_pattern_error:
    'A password deve conter pelo menos {{min}} caracteres e ter uma combinação de letras, números e símbolos.',
  insecure_contexts: 'Contextos inseguros (não HTTPS) não são compatíveis.',
  unexpected_error: 'Ocorreu um erro inesperado',
  not_found: '404 not found',
  create_internal_role_violation:
    'Está a criar uma nova função interna que é proibida pelo Logto. Tente outro nome que não comece com "#internal:".',
};

export default errors;
