const security = {
  page_title: 'Segurança',
  title: 'Segurança',
  subtitle: 'Configure proteções avançadas para se defender contra ataques complexos.',
  tabs: {
    captcha: 'CAPTCHA',
    password_policy: 'Política de senha',
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
    recaptcha_key_id: 'ID da chave reCAPTCHA',
    recaptcha_api_key: 'Chave da API do projeto',
    deletion_description: 'Tem certeza de que deseja excluir este provedor de CAPTCHA?',
    captcha_deleted: 'Provedor de CAPTCHA excluído com sucesso',
    setup_captcha: 'Configurar CAPTCHA',
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
  },
  sentinel_policy: {
    card_title: 'Bloqueio de identificador',
    card_description:
      'Bloqueie um identificador provisoriamente após múltiplas autenticações falhas (por exemplo, login com senha ou código de verificação incorreto consecutivo) para prevenir acesso por força bruta.',
    max_attempts: {
      title: 'Máximo de tentativas falhas',
      description:
        'Limite de tentativas consecutivas de login falho por identificador. Exceder esse limite aciona um bloqueio temporário.',
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
    },
  },
};

export default Object.freeze(security);
