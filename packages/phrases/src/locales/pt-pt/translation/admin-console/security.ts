const security = {
  page_title: 'Segurança',
  title: 'Segurança',
  subtitle: 'Configure proteções avançadas para se defender contra ataques complexos.',
  bot_protection: {
    title: 'Proteção contra bots',
    description:
      'Ative CAPTCHA para registo, login e recuperação de palavra-passe para bloquear ameaças automatizadas.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'Selecione um fornecedor de CAPTCHA e configure a integração.',
      add: 'Adicionar CAPTCHA',
    },
    settings: 'Configurações',
    enable_captcha: 'Ativar CAPTCHA',
    enable_captcha_description:
      'Ativar verificação CAPTCHA para fluxos de inscrição, entrada e recuperação de senha.',
  },
  create_captcha: {
    setup_captcha: 'Configurar CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Solução empresarial de CAPTCHA da Google que oferece deteção avançada de ameaças e análises de segurança detalhadas para proteger o seu site contra atividades fraudulentas.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'Alternativa inteligente ao CAPTCHA da Cloudflare, que oferece proteção não intrusiva contra bots, garantindo uma experiência de utilizador fluida sem quebra-cabeças visuais.',
    },
  },
  captcha_details: {
    back_to_security: 'Voltar à Segurança',
    page_title: 'Detalhes do CAPTCHA',
    check_readme: 'Consultar README',
    options_change_captcha: 'Alterar fornecedor de CAPTCHA',
    connection: 'Ligação',
    description: 'Configure a sua ligação CAPTCHA.',
    site_key: 'Chave do site',
    secret_key: 'Chave secreta',
    project_id: 'ID do projeto',
    recaptcha_key_id: 'ID da chave reCAPTCHA',
    recaptcha_api_key: 'Chave de API do projeto',
    deletion_description: 'Tem a certeza de que deseja eliminar este fornecedor de CAPTCHA?',
    captcha_deleted: 'Fornecedor de CAPTCHA eliminado com sucesso',
    setup_captcha: 'Configurar CAPTCHA',
  },
};

export default Object.freeze(security);
