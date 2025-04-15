const security = {
  page_title: 'Segurança',
  title: 'Segurança',
  subtitle: 'Configure proteções avançadas para se defender contra ataques complexos.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Política de password',
  },
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
  password_policy: {
    password_requirements: 'Requisitos de password',
    minimum_length: 'Comprimento mínimo',
    minimum_length_description:
      'O NIST sugere o uso de <a>pelo menos 8 caracteres</a> para produtos web.',
    minimum_length_error: 'O comprimento mínimo deve estar entre {{min}} e {{max}} (inclusive).',
    minimum_required_char_types: 'Tipos de caracteres mínimos necessários',
    minimum_required_char_types_description:
      'Tipos de caracteres: letras maiúsculas (A-Z), letras minúsculas (a-z), números (0-9) e símbolos especiais ({{symbols}}).',
    password_rejection: 'Rejeição de password',
    compromised_passwords: 'Passwords comprometidos',
    breached_passwords: 'Passwords violados',
    breached_passwords_description:
      'Recusar passwords encontradas anteriormente em bancos de dados de violação.',
    restricted_phrases: 'Frases de baixa segurança restritas',
    restricted_phrases_tooltip:
      'Your password should avoid these phrases unless you combine with 3 or more extra characters.',
    repetitive_or_sequential_characters: 'Caracteres repetitivos ou sequenciais',
    repetitive_or_sequential_characters_description: 'Ex., "AAAA", "1234" e "abcd".',
    user_information: 'Informações do utilizador',
    user_information_description:
      'Ex., endereço de email, número de telefone, nome de utilizador, etc.',
    custom_words: 'Palavras personalizadas',
    custom_words_description:
      'Personalize palavras específicas do contexto, não diferenciando maiúsculas de minúsculas e uma por linha.',
    custom_words_placeholder: 'Nome de seu serviço, nome da empresa, etc.',
  },
};

export default Object.freeze(security);
