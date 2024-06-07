const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Crie ganchos da web para receber atualizações em tempo real sobre eventos específicos sem esforço.',
  create: 'Criar Webhook',
  schemas: {
    interaction: 'Interac\u00E7\u00E3o do usu\u00E1rio',
    user: 'Usu\u00E1rio',
    organization: 'Organiza\u00E7\u00E3o',
    role: 'Fun\u00E7\u00E3o',
    scope: 'Permiss\u00E3o',
    organization_role: 'Fun\u00E7\u00E3o da organiza\u00E7\u00E3o',
    organization_scope: 'Permiss\u00E3o da organiza\u00E7\u00E3o',
  },
  table: {
    name: 'Nome',
    events: 'Eventos',
    success_rate: 'Taxa de sucesso (24h)',
    requests: 'Requisi\u00E7\u00F5es (24h)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Crie um webhook para receber atualiza\u00E7\u00F5es em tempo real por meio de solicita\u00E7\u00F5es POST para o URL do seu ponto de extremidade. Fique informado e tome medidas imediatas em eventos como "Criar conta", "Entrar" e "Redefinir senha".',
    create_webhook: 'Criar Webhook',
  },
  create_form: {
    title: 'Criar Webhook',
    subtitle:
      'Adicione o Webhook para enviar uma solicita\u00E7\u00E3o POST para o URL do endpoint com detalhes de quaisquer eventos de usu\u00E1rios.',
    events: 'Eventos',
    events_description:
      'Selecione os eventos de gatilho que o Logto enviar\u00E1 a solicita\u00E7\u00E3o POST.',
    name: 'Nome',
    name_placeholder: 'Digite o nome do webhook',
    endpoint_url: 'URL de endpoint',
    endpoint_url_placeholder: 'https://seu.url.endpoint.do.webhook',
    endpoint_url_tip:
      'Insira o URL do seu ponto de extremidade para o qual a carga \u00FAtil de um webhook \u00E9 enviada quando o evento ocorre.',
    create_webhook: 'Criar webhook',
    missing_event_error: 'Voc\u00EA precisa selecionar pelo menos um evento.',
  },
  webhook_created: 'O webhook {{name}} foi criado com sucesso.',
};

export default Object.freeze(webhooks);
