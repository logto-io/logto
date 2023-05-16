const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Os webhooks fornecem atualizações em tempo real sobre eventos específicos para o URL do seu ponto final, permitindo reações imediatas.',
  create: 'Criar Webhook',
  events: {
    post_register: 'Criar nova conta',
    post_sign_in: 'Entrar',
    post_reset_password: 'Redefinir senha',
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
      'Os webhooks fornecem atualizações em tempo real sobre eventos específicos para o URL do seu ponto final, permitindo reações imediatas. Os eventos "Criar nova conta, Entrar, Redefinir senha" agora são suportados.',
    create_webhook: 'Criar Webhook',
  },
  create_form: {
    title: 'Criar Webhook',
    subtitle:
      'Adicione o Webhook para enviar uma solicitação POST para o URL do ponto final com detalhes de quaisquer eventos de usuários.',
    events: 'Eventos',
    events_description:
      'Selecione os eventos de gatilho nos quais o Logto enviará a solicitação POST.',
    name: 'Nome',
    name_placeholder: 'Digite o nome do webhook',
    endpoint_url: 'URL do ponto final',
    endpoint_url_placeholder: 'https://seu.url.de.ponto.final/webhook',
    endpoint_url_tip:
      'Insira o URL HTTPS do seu ponto final, onde o payload de um webhook é enviado quando o evento ocorre.',
    create_webhook: 'Criar webhook',
    missing_event_error: 'Você deve selecionar pelo menos um evento.',
    https_format_error: 'Formato HTTPS exigido por motivos de segurança.',
    block_description:
      'A versão atual suporta apenas até três webhooks. Se você precisar de webhooks adicionais, envie um e-mail para nossa equipe de suporte em <a>{{link}}</a> e ficaremos felizes em ajudá-lo.',
  },
  webhook_created: 'O webhook {{name}} foi criado com sucesso.',
};

export default webhooks;
