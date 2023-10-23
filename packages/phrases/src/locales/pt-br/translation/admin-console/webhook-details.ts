const webhook_details = {
  page_title: 'Detalhes do webhook',
  back_to_webhooks: 'Voltar para Webhooks',
  not_in_use: 'Não em uso',
  success_rate: 'Taxa de sucesso',
  requests: '{{value, number}} requisições em 24h',
  disable_webhook: 'Desativar webhook',
  disable_reminder:
    'Tem certeza de que deseja reativar este webhook? Isso não enviará uma solicitação HTTP para o URL do endpoint.',
  webhook_disabled: 'O webhook foi desativado.',
  webhook_reactivated: 'O webhook foi reativado.',
  reactivate_webhook: 'Reativar webhook',
  delete_webhook: 'Excluir webhook',
  deletion_reminder:
    'Você está removendo este webhook. Depois de excluí-lo, não enviará solicitação HTTP para o URL do endpoint.',
  deleted: 'O webhook foi excluído com sucesso.',
  settings_tab: 'Configurações',
  recent_requests_tab: 'Solicitações recentes (24h)',
  settings: {
    settings: 'Configurações',
    settings_description:
      'Os webhooks permitem que você receba atualizações em tempo real sobre eventos específicos conforme eles ocorrem, enviando uma solicitação POST para o URL do seu endpoint. Isso permite que você tome ações imediatas com base nas novas informações recebidas.',
    events: 'Eventos',
    events_description: 'Selecione os eventos de gatilho que o Logto enviará a solicitação POST.',
    name: 'Nome',
    endpoint_url: 'URL do Endpoint',
    signing_key: 'Chave de assinatura',
    signing_key_tip:
      'Adicione a chave secreta fornecida pelo Logto ao seu endpoint como um cabeçalho de solicitação para garantir a autenticidade do payload do webhook.',
    regenerate: 'Regenerar',
    regenerate_key_title: 'Regenerar chave de assinatura',
    regenerate_key_reminder:
      'Tem certeza de que deseja modificar a chave de assinatura? A regeneração terá efeito imediato. Lembre-se de modificar a chave de assinatura de forma síncrona em seu endpoint.',
    regenerated: 'A chave de assinatura foi regenerada.',
    custom_headers: 'Cabeçalhos personalizados',
    custom_headers_tip:
      'Opcionalmente, você pode adicionar cabeçalhos personalizados ao payload do webhook para fornecer contexto ou metadados adicionais sobre o evento.',
    key_duplicated_error: 'As chaves não podem ser repetidas.',
    key_missing_error: 'A chave é obrigatória.',
    value_missing_error: 'O valor é obrigatório.',
    invalid_key_error: 'Chave inválida',
    invalid_value_error: 'O valor é inválido',
    test: 'Testar',
    test_webhook: 'Teste seu webhook',
    test_webhook_description:
      'Configure o webhook e teste-o com exemplos de carga para cada evento selecionado para verificação da recepção e processamento corretos.',
    send_test_payload: 'Enviar carga de teste',
    test_result: {
      endpoint_url: 'URL do ponto de extremidade: {{url}}',
      message: 'Mensagem: {{message}}',
      response_status: 'Status da resposta: {{status, number}}',
      response_body: 'Corpo da resposta: {{body}}',
      request_time: 'Tempo da solicitação: {{time}}',
      test_success: 'O teste de webhook para o ponto de extremidade foi bem-sucedido.',
    },
  },
};

export default Object.freeze(webhook_details);
