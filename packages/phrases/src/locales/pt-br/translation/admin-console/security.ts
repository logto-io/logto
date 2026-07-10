const security = {
  page_title: 'Segurança',
  title: 'Segurança',
  subtitle: 'Configure proteções avançadas para se defender contra ataques complexos.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Política de senha',
    blocklist: 'Lista de bloqueio',
    general: 'Geral',
  },
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
    enable_captcha: 'Ativar CAPTCHA',
    enable_captcha_description:
      'Ativar verificação CAPTCHA para fluxos de cadastro, login e recuperação de senha.',
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
    domain: 'Domínio (opcional)',
    domain_placeholder: 'www.google.com (padrão) ou recaptcha.net',
    recaptcha_key_id: 'ID da chave reCAPTCHA',
    recaptcha_api_key: 'Chave da API do projeto',
    deletion_description: 'Tem certeza de que deseja excluir este provedor de CAPTCHA?',
    captcha_deleted: 'Provedor de CAPTCHA excluído com sucesso',
    setup_captcha: 'Configurar CAPTCHA',
    mode: 'Modo de verificação',
    mode_invisible: 'Invisível',
    mode_checkbox: 'Caixa de seleção',
    mode_notice:
      'O modo de verificação é definido nas configurações da chave reCAPTCHA no Google Cloud Console. Alterar o modo aqui requer um tipo de chave correspondente.',
  },
  password_policy: {
    password_requirements: 'Requisitos de senha',
    password_requirements_description:
      'Aprimore os requisitos de senha para se defender contra ataques de stuffing de credenciais e senhas fracas.',
    minimum_length: 'Comprimento mínimo',
    minimum_length_description:
      'O NIST sugere o uso de <a>pelo menos 8 caracteres</a> para produtos na web.',
    minimum_length_error: 'O comprimento mínimo deve estar entre {{min}} e {{max}} (inclusive).',
    minimum_required_char_types: 'Tipos de caracteres mínimos necessários',
    minimum_required_char_types_description:
      'Tipos de caracteres: maiúsculas (A-Z), minúsculas (a-z), números (0-9) e símbolos especiais ({{symbols}}).',
    password_rejection: 'Rejeição de senha',
    compromised_passwords: 'Senhas comprometidas',
    breached_passwords: 'Senhas comprometidas',
    breached_passwords_description:
      'Rejeitar senhas encontradas em bancos de dados de violações anteriores.',
    restricted_phrases: 'Restringir frases de baixa segurança',
    restricted_phrases_tooltip:
      'Sua senha deve evitar essas frases, a menos que você combine com 3 ou mais caracteres extras.',
    repetitive_or_sequential_characters: 'Caracteres repetitivos ou sequenciais',
    repetitive_or_sequential_characters_description: 'Por exemplo, "AAAA", "1234" e "abcd".',
    user_information: 'Informações do usuário',
    user_information_description:
      'Por exemplo, endereço de e-mail, número de telefone, nome de usuário, etc.',
    custom_words: 'Palavras personalizadas',
    custom_words_description:
      'Personalize palavras específicas do contexto, sem diferenciação de maiúsculas e minúsculas, e uma por linha.',
    custom_words_placeholder: 'Nome do seu serviço, nome da empresa, etc.',
    password_expiration: 'Expiração de senha',
    password_expiration_description:
      'Exigir que os usuários redefinam sua senha após um número definido de dias. Usuários que entram via SSO ou passkey não são afetados.',
    enable_password_expiration: 'Ativar expiração de senha',
    enable_password_expiration_description:
      'Exigir que os usuários redefinam periodicamente sua senha. Usuários existentes sem uma data de alteração de senha registrada serão avaliados a partir da data em que esta política foi ativada.',
    enable_password_expiration_tip:
      'Você só pode ativar a expiração de senha depois de configurar ao menos um método de recuperação de senha com um conector válido na experiência de login.',
    expiration_period: 'Período de validade da senha (dias)',
    expiration_period_description:
      'Número de dias que uma senha permanece válida antes de expirar.',
    expiration_period_error:
      'O período de validade da senha deve estar entre {{min}} e {{max}} dias.',
    password_expiration_recovery_reminder:
      'Alguns usuários podem não ter um endereço de e-mail ou número de telefone para receber um código de recuperação de senha, portanto não poderão redefinir uma senha expirada. Exija um endereço de e-mail ou número de telefone no cadastro para garantir que todos os usuários possam recuperar sua senha.',
  },
  verification_code_policy: {
    card_title: 'Código de verificação',
    card_description:
      'Configure a duração da expiração e o número máximo de novas tentativas para códigos de verificação usados nos fluxos de entrada, cadastro e redefinição de senha.',
    enable: {
      title: 'Personalizar configurações do código de verificação',
      description:
        'Permitir a personalização da duração da expiração do código de verificação e do número máximo de novas tentativas.',
    },
    expiration_duration: {
      title: 'Duração da expiração (segundos)',
      description:
        'A duração em segundos pela qual um código de verificação permanece válido após ser enviado.',
      error_message: 'A duração da expiração deve estar entre 60 e 3600 segundos.',
    },
    max_retry_attempts: {
      title: 'Número máximo de novas tentativas',
      description:
        'Número máximo de tentativas de verificação com falha permitido antes que o código seja invalidado.',
      error_message: 'O número máximo de novas tentativas deve estar entre 1 e 100.',
    },
  },

  sentinel_policy: {
    card_title: 'Bloqueio de identificador',
    card_description:
      'O bloqueio está disponível para todos os usuários com configurações padrão, mas você pode personalizá-lo para ter mais controle.\n\nBloqueie temporariamente um identificador após várias tentativas de autenticação falhas (por exemplo, senha incorreta consecutiva ou código de verificação) para evitar acesso por força bruta.',
    enable_sentinel_policy: {
      title: 'Personalizar experiência de bloqueio',
      description:
        'Permitir personalização das tentativas máximas de login falhas antes do bloqueio, duração do bloqueio e desbloqueio manual imediato.',
    },
    max_attempts: {
      title: 'Máximo de tentativas falhas',
      description:
        'Bloqueie temporariamente um identificador após atingir o número máximo de tentativas de login falhas em uma hora.',
      error_message: 'O máximo de tentativas falhas deve ser maior que 0.',
    },
    lockout_duration: {
      title: 'Duração do bloqueio (minutos)',
      description:
        'Bloqueie logins por um período após exceder o limite máximo de tentativas falhas.',
      error_message: 'A duração do bloqueio deve ser de pelo menos 1 minuto.',
    },
    manual_unlock: {
      title: 'Desbloqueio manual',
      description:
        'Desbloqueie usuários imediatamente confirmando sua identidade e inserindo seu identificador.',
      unblock_by_identifiers: 'Desbloquear por identificador',
      modal_description_1:
        'Um identificador foi temporariamente bloqueado devido a múltiplas tentativas de login/cadastro falhas. Para proteger a segurança, o acesso será restaurado automaticamente após a duração do bloqueio.',
      modal_description_2:
        ' Desbloqueie manualmente apenas se você confirmou a identidade do usuário e garantiu que não houve tentativas de acesso não autorizado.',
      placeholder:
        'Digite os identificadores (endereço de e-mail / número de telefone / nome de usuário)',
      confirm_button_text: 'Desbloquear agora',
      success_toast: 'Desbloqueado com sucesso',
      duplicate_identifier_error: 'Identificador já adicionado',
      empty_identifier_error: 'Por favor, insira pelo menos um identificador',
    },
  },
  blocklist: {
    card_title: 'Lista de bloqueio de emails',
    card_description:
      'Assuma o controle da sua base de usuários bloqueando endereços de email de alto risco ou indesejados.',
    disposable_email: {
      title: 'Bloquear endereços de email descartáveis',
      description:
        'Ative para rejeitar qualquer tentativa de inscrição usando um endereço de email descartável ou temporário, o que pode prevenir spam e melhorar a qualidade dos usuários.',
    },
    email_subaddressing: {
      title: 'Bloquear subendereçamento de email',
      description:
        'Ative para rejeitar qualquer tentativa de inscrição usando subendereços de email com um sinal de mais (+) e caracteres adicionais (por exemplo, user+alias@foo.com).',
    },
    custom_email_address: {
      title: 'Bloquear endereços de email personalizados',
      description:
        'Adicione regras para bloquear domínios de email específicos, endereços de email ou padrões de endereço de email com curinga de se registrar ou vincular via UI.',
      placeholder:
        'Digite o endereço de email, domínio ou padrão de endereço de email com curinga bloqueado (por exemplo, bar@example.com, @example.com, foo*@example.com, *@example.com)',
      duplicate_error:
        'Endereço de email, domínio ou padrão de endereço de email com curinga já adicionado',
      invalid_format_error:
        'Deve ser um endereço de email válido (bar@example.com), domínio (@example.com) ou padrão de endereço de email com curinga (foo*@example.com, *@example.com)',
    },
  },
};

export default Object.freeze(security);
