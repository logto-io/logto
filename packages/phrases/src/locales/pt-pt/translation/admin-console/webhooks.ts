const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle: 'Crie webhooks para receber atualizações em tempo real sobre eventos específicos.',
  create: 'Criar Webhook',
  schemas: {
    interaction: 'Interação do utilizador',
    user: 'Utilizador',
    organization: 'Organização',
    role: 'Função',
    scope: 'Permissão',
    organization_role: 'Função da organização',
    organization_scope: 'Permissão da organização',
  },
  table: {
    name: 'Nome',
    events: 'Eventos',
    success_rate: 'Taxa de sucesso (24h)',
    requests: 'Solicitações (24h)',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Crie um webhook para receber atualizações em tempo real por meio de solicitações POST para sua URL de endpoint. Fique informado e tome medidas imediatas em eventos como "Criar conta", "Entrar" e "Redefinir senha".',
    create_webhook: 'Criar Webhook',
  },
  create_form: {
    title: 'Criar Webhook',
    subtitle:
      'Adicione o Webhook para enviar uma solicitação POST para o URL do ponto final com detalhes de quaisquer eventos de utilizadores.',
    events: 'Eventos',
    events_description:
      'Selecione os eventos de gatilho nos quais o Logto enviará a solicitação POST.',
    name: 'Nome',
    name_placeholder: 'Digite o nome do webhook',
    endpoint_url: 'URL do ponto final',
    endpoint_url_placeholder: 'https://seu.url.de.ponto.final/webhook',
    endpoint_url_tip:
      'Digite o URL do seu ponto final para onde o payload do webhook é enviado quando o evento ocorre.',
    create_webhook: 'Criar webhook',
    missing_event_error: 'Você deve selecionar pelo menos um evento.',
  },
  webhook_created: 'O webhook {{name}} foi criado com sucesso.',
};

export default Object.freeze(webhooks);
