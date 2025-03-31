const security = {
  page_title: 'Segurança',
  title: 'Segurança',
  subtitle: 'Configure proteções avançadas para se defender contra ataques complexos.',
  bot_protection: {
    title: 'Proteção contra bots',
    description:
      'Ative CAPTCHA para registro, login e recuperação de senha para bloquear ameaças automatizadas.',
    captcha: {
      title: 'CAPTCHA',
      placeholder: 'Selecione um provedor de CAPTCHA e configure a integração.',
      add: 'Adicionar CAPTCHA',
    },
    settings: 'Configurações',
    captcha_required_flows: 'Fluxos que exigem CAPTCHA',
    sign_up: 'Registro',
    sign_in: 'Login',
    forgot_password: 'Esqueci a senha',
  },
  create_captcha: {
    setup_captcha: 'Configurar CAPTCHA',
  },
  captcha_providers: {
    recaptcha_enterprise: {
      name: 'reCAPTCHA Enterprise',
      description:
        'Solução de CAPTCHA empresarial do Google que oferece detecção avançada de ameaças e análises de segurança detalhadas para proteger seu site contra atividades fraudulentas.',
    },
    turnstile: {
      name: 'Cloudflare Turnstile',
      description:
        'Alternativa inteligente de CAPTCHA da Cloudflare que oferece proteção contra bots sem interrupções, garantindo uma experiência de usuário perfeita sem quebra-cabeças visuais.',
    },
  },
  captcha_details: {
    back_to_security: 'Voltar para Segurança',
    page_title: 'Detalhes do CAPTCHA',
    check_readme: 'Verificar README',
    options_change_captcha: 'Alterar provedor de CAPTCHA',
    connection: 'Conexão',
    description: 'Configure sua conexão de CAPTCHA.',
    site_key: 'Chave do site',
    secret_key: 'Chave secreta',
    project_id: 'ID do projeto',
    deletion_description: 'Tem certeza de que deseja excluir este provedor de CAPTCHA?',
    captcha_deleted: 'Provedor de CAPTCHA excluído com sucesso',
    setup_captcha: 'Configurar CAPTCHA',
  },
};

export default Object.freeze(security);
