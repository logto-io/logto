const connector = {
  general: 'Ocorreu um erro no conector: {{errorDescription}}',
  not_found: 'Não foi possível encontrar nenhum conector disponível para o tipo: {{type}}.',
  not_enabled: 'O conector não está ativado.',
  invalid_metadata: 'Os metadados do conector são inválidos.',
  invalid_config_guard: 'A proteção de configuração do conector é inválida.',
  unexpected_type: 'O tipo do conector é inesperado.',
  invalid_request_parameters: 'A solicitação está com parâmetro(s) de entrada incorreto(s).',
  insufficient_request_parameters: 'A solicitação pode perder alguns parâmetros de entrada.',
  invalid_config: 'A configuração do conector é inválida.',
  invalid_response: 'A resposta do conector é inválida.',
  template_not_found: 'Não foi possível encontrar o modelo correto na configuração do conector.',
  not_implemented: '{{method}}: ainda não foi implementado.',
  social_invalid_access_token: 'O token de acesso do conector é inválido.',
  invalid_auth_code: 'O código de autenticação do conector é inválido.',
  social_invalid_id_token: 'O token de id do conector é inválido.',
  authorization_failed: 'O processo de autorização do usuário não foi bem-sucedido.',
  social_auth_code_invalid:
    'Não foi possível obter o token de acesso, verifique o código de autorização.',
  more_than_one_sms: 'O número de conectores SMS é maior que 1.',
  more_than_one_email: 'O número de conectores de e-mail é maior que 1.',
  more_than_one_connector_factory:
    'Foram encontradas várias fábricas de conectores (com os ids {{connectorIds}}), você pode desinstalar as desnecessárias.',
  db_connector_type_mismatch: 'Existe um conector no banco de dados que não corresponde ao tipo.',
  not_found_with_connector_id:
    'Não é possível encontrar o conector com o ID de conector padrão fornecido.',
  multiple_instances_not_supported:
    'Não é possível criar várias instâncias com conector padrão escolhido.',
  invalid_type_for_syncing_profile:
    'Você só pode sincronizar o perfil do usuário com conectores sociais.',
  can_not_modify_target: 'O destino do conector não pode ser modificado.',
  should_specify_target: "Você deve especificar o 'destino'.",
  multiple_target_with_same_platform:
    'Você não pode ter vários conectores sociais com o mesmo destino e plataforma.',
  cannot_overwrite_metadata_for_non_standard_connector:
    "Esta 'metadata' do conector não pode ser sobrescrita.",
};
export default connector;
