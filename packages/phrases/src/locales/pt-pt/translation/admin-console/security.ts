const security = {
  page_title: 'Segurança',
  title: 'Segurança',
  subtitle: 'Configure proteções avançadas para se defender contra ataques complexos.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Política de password',
    blocklist: 'Lista de bloqueio',
    general: 'Geral',
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
    domain: 'Domínio (opcional)',
    domain_placeholder: 'www.google.com (padrão) ou recaptcha.net',
    recaptcha_key_id: 'ID da chave reCAPTCHA',
    recaptcha_api_key: 'Chave de API do projeto',
    deletion_description: 'Tem a certeza de que deseja eliminar este fornecedor de CAPTCHA?',
    captcha_deleted: 'Fornecedor de CAPTCHA eliminado com sucesso',
    setup_captcha: 'Configurar CAPTCHA',
    mode: 'Modo de verificação',
    mode_invisible: 'Invisível',
    mode_checkbox: 'Caixa de seleção',
    mode_notice:
      'O modo de verificação é definido nas definições da chave reCAPTCHA na Google Cloud Console. Alterar o modo aqui requer um tipo de chave correspondente.',
  },
  password_policy: {
    password_requirements: 'Requisitos de password',
    password_requirements_description:
      'Aprimorar os requisitos de senha para se defender contra ataques de stuffing de credenciais e senhas fracas. ',
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
      'A tua password deve evitar essas frases, a menos que combines com 3 ou mais caracteres adicionais.',
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
  sentinel_policy: {
    card_title: 'Bloqueio de identificador',
    card_description:
      'O bloqueio está disponível para todos os utilizadores com configurações padrão, mas podes personalizá-lo para maior controle.\n\nBloqueia temporariamente um identificador após várias tentativas de autenticação falhadas (por exemplo, uma sequência de senhas ou códigos de verificação incorretos) para impedir acesso por força bruta.',
    enable_sentinel_policy: {
      title: 'Personalizar experiência de bloqueio',
      description:
        'Permitir a personalização do máximo de tentativas de login falhadas antes do bloqueio, duração do bloqueio, e desbloqueio manual imediato.',
    },
    max_attempts: {
      title: 'Máximo de tentativas falhadas',
      description:
        'Bloqueia temporariamente um identificador após atingir o número máximo de tentativas de login falhadas em uma hora.',
      error_message: 'O máximo de tentativas falhadas deve ser maior que 0.',
    },
    lockout_duration: {
      title: 'Duração do bloqueio (minutos)',
      description:
        'Bloquear login por um período após exceder o limite máximo de tentativas falhadas.',
      error_message: 'A duração do bloqueio deve ser de pelo menos 1 minuto.',
    },
    manual_unlock: {
      title: 'Desbloqueio manual',
      description:
        'Desbloqueie usuários imediatamente confirmando sua identidade e inserindo seu identificador.',
      unblock_by_identifiers: 'Desbloquear por identificador',
      modal_description_1:
        'Um identificador foi temporariamente bloqueado devido a várias tentativas de login/registro falhadas. Para proteger a segurança, o acesso será restaurado automaticamente após a duração do bloqueio.',
      modal_description_2:
        'Desbloqueie manualmente apenas se você tiver certeza da identidade do usuário e garantido que não houve tentativas de acesso não autorizado.',
      placeholder:
        'Insira identificadores (endereço de email / número de telefone / nome de utilizador)',
      confirm_button_text: 'Desbloquear agora',
      success_toast: 'Desbloqueado com sucesso',
      duplicate_identifier_error: 'Identificador já adicionado',
      empty_identifier_error: 'Por favor, insira pelo menos um identificador',
    },
  },
  blocklist: {
    card_title: 'Lista de bloqueio de email',
    card_description:
      'Assuma o controle da sua base de utilizadores, bloqueando endereços de email de alto risco ou indesejados.',
    disposable_email: {
      title: 'Bloquear endereços de email descartáveis',
      description:
        'Ativar para rejeitar qualquer tentativa de inscrição usando um endereço de email descartável ou temporário, o que pode prevenir spam e melhorar a qualidade dos utilizadores.',
    },
    email_subaddressing: {
      title: 'Bloquear subendereços de email',
      description:
        'Ativar para rejeitar qualquer tentativa de inscrição que utilize subendereços de email com um sinal de mais (+) e caracteres adicionais (por exemplo, user+alias@foo.com).',
    },
    custom_email_address: {
      title: 'Bloquear endereços de email personalizados',
      description:
        'Adicionar domínios de email ou endereços de email específicos que não possam se registar ou vincular via a IU.',
      placeholder:
        'Insira o endereço de email ou domínio bloqueado (por exemplo, bar@example.com, @example.com)',
      duplicate_error: 'Endereço de email ou domínio já adicionado',
      invalid_format_error:
        'Deve ser um endereço de email válido(bar@example.com) ou domínio(@example.com)',
    },
  },
};

export default Object.freeze(security);
