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
  password_pattern_error: 'A senha requer um mínimo de 6 caracteres',
  insecure_contexts: 'Contextos inseguros (não-HTTPS) não são suportados.',
  unexpected_error: 'Um erro inesperado ocorreu',
};

export default errors;
