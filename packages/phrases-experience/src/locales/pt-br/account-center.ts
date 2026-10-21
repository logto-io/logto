const account_center = {
  home: {
    title: 'Página não encontrada',
    description: 'Esta página não está disponível.',
  },
  page: {
    title: 'Conta',
    security_title: 'Segurança',
    security_description:
      'Altere as configurações da sua conta aqui para garantir a segurança dela.',
    profile_title: 'Informações pessoais',
    profile_description: 'Altere suas informações pessoais aqui.',
    sidebar_personal_info: 'Informações pessoais',
    sidebar_security: 'Segurança',
    sidebar_sessions: 'Sessões',
    support: 'Suporte',
    user_menu: 'Menu do usuário',
    sign_out: 'Sair',
  },
  verification: {
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
    error_verify_failed: 'Falha na verificação. Digite o código novamente.',
    step_up_not_completed:
      'A verificação de identidade não foi concluída. Nenhuma alteração foi feita na sua conta.',
  },
  email: {
    title: 'Vincular e-mail',
    description: 'Vincule seu e-mail para entrar ou ajudar na recuperação da conta.',
    verification_title: 'Digite o código de verificação de e-mail',
    verification_description:
      'O código de verificação foi enviado para seu e-mail {{email_address}}.',
    success: 'E-mail principal vinculado com sucesso.',
  },
  phone: {
    title: 'Vincular número de telefone',
    description: 'Vincule seu número de telefone para entrar ou ajudar na recuperação da conta.',
    verification_title: 'Digite o código de verificação SMS',
    verification_description:
      'O código de verificação foi enviado para o seu telefone {{phone_number}}.',
    success: 'Telefone principal vinculado com sucesso.',
  },
  username: {
    title: 'Definir nome de usuário',
    description: 'O nome de usuário deve conter apenas letras, números e sublinhados.',
    policy_description: '{{requirements}}',
    success: 'Nome de usuário atualizado com sucesso.',
  },
  security: {
    add: 'Adicionar',
    change: 'Alterar',
    remove: 'Remover',
    not_set: 'Não definido',
    social_sign_in: 'Login social',
    social_not_linked: 'Não vinculado',
    email_phone: 'E-mail / Telefone',
    email: 'E-mail',
    phone: 'Telefone',
    password: 'Senha',
    configured: 'Configurado',
    not_configured: 'Não configurado',
    two_step_verification: 'Verificação em duas etapas',
    authenticator_app: 'Aplicativo autenticador',
    passkeys: 'Passkeys',
    backup_codes: 'Códigos de backup',
    email_verification_code: 'Código de verificação por e-mail',
    phone_verification_code: 'Código de verificação por telefone',
    passkeys_count_one: '{{count}} passkey',
    passkeys_count_other: '{{count}} passkeys',
    backup_codes_count_one: '{{count}} código restante',
    backup_codes_count_other: '{{count}} códigos restantes',
    view: 'Visualizar',
    manage: 'Gerenciar',
    turn_on_2_step_verification_description:
      'Adicione uma camada extra de segurança. Você será solicitado a realizar uma segunda etapa de verificação ao fazer login.',
    turn_off_2_step_verification: 'Desativar verificação em duas etapas',
    turn_off_2_step_verification_description:
      'Desativar a verificação em duas etapas removerá a camada extra de proteção da sua conta ao fazer login. Tem certeza de que deseja continuar?',
    disable_2_step_verification: 'Desativar',
    no_verification_method_warning:
      'Você não adicionou um segundo método de verificação. Adicione pelo menos um para ativar a verificação em duas etapas ao fazer login.',
    passkey_sign_in_prompt: 'Solicitar a configuração de uma passkey',
    passkey_sign_in_prompt_description:
      'Quando ativado, será solicitado que você configure uma passkey para um login mais rápido e seguro.',
    account_removal: 'Exclusão da conta',
    delete_your_account: 'Excluir sua conta',
    delete_account: 'Excluir conta',
    remove_username_confirmation_title: 'Remover nome de usuário',
    remove_username_confirmation_description:
      'Após a remoção, você não poderá mais fazer login com este nome de usuário. Tem certeza de que deseja continuar?',
    remove_email_confirmation_title: 'Remover endereço de e-mail',
    remove_email_confirmation_description:
      'Após a remoção, você não poderá mais fazer login com este endereço de e-mail. Tem certeza de que deseja continuar?',
    remove_phone_confirmation_title: 'Remover número de telefone',
    remove_phone_confirmation_description:
      'Após a remoção, você não poderá mais fazer login com este número de telefone. Tem certeza de que deseja continuar?',
    email_removed: 'Endereço de e-mail removido com sucesso.',
    phone_removed: 'Número de telefone removido com sucesso.',
    username_removed: 'Nome de usuário removido com sucesso.',
    trusted_devices: {
      title: 'Dispositivos confiáveis de MFA',
      current_device: 'Dispositivo atual',
      expires_on: 'Expira em {{date}}',
      unknown_location: 'Localização desconhecida',
      remove: 'Remover',
      removed: 'Dispositivo confiável removido com sucesso.',
      loading: 'Carregando...',
      empty: 'Nenhum dispositivo confiável.',
      load_failed: 'Falha ao carregar dispositivos confiáveis. Tente novamente.',
      retry: 'Tentar novamente',
      remove_confirmation_title: 'Remover dispositivo confiável?',
      remove_confirmation_description:
        'Você precisará concluir a MFA novamente neste dispositivo na próxima vez que entrar. Sua sessão atual permanecerá ativa.',
    },
    personal_access_tokens: {
      title: 'Tokens de acesso pessoal',
      description:
        'Use tokens de acesso pessoal para se autenticar em APIs em seu nome. Eles permanecem ativos até expirarem ou serem revogados, mesmo que você saia da conta ou altere sua senha.',
      create: 'Criar novo token',
      created_at: 'Criado em {{date}}',
      expires_on: 'Expira em {{date}}',
      expired_on: 'Expirou em {{date}}',
      expired: 'Expirado',
      never_expires: 'Nunca expira',
      never_expires_warning:
        'Este token não tem data de expiração. Para maior segurança, crie um novo token com data de expiração e revogue este.',
      rename: 'Renomear',
      revoke: 'Revogar',
      loading: 'Carregando...',
      empty: 'Nenhum token de acesso pessoal.',
      load_failed: 'Falha ao carregar os tokens de acesso pessoal. Tente novamente.',
      retry: 'Tentar novamente',
      create_modal_title: 'Criar token de acesso pessoal',
      create_modal_description:
        'Dê ao seu token um nome descritivo e escolha um período de expiração.',
      token_name: 'Nome do token',
      token_name_placeholder: 'Meu token',
      expiration: 'Expiração',
      expiration_days: '{{count}} dias',
      created_modal_title: 'Token de acesso pessoal criado',
      show_once_warning:
        'Você não poderá ver este token novamente. Copie-o agora e guarde-o em um local seguro.',
      copied: 'Token de acesso pessoal copiado.',
      rename_modal_title: 'Renomear token de acesso pessoal',
      rename_modal_description: 'Digite um novo nome para este token de acesso pessoal.',
      renamed: 'Token de acesso pessoal renomeado com sucesso.',
      revoke_confirmation_title: 'Revogar token de acesso pessoal?',
      revoke_confirmation_description:
        'Quaisquer aplicativos ou scripts que usem "{{name}}" perderão o acesso imediatamente. Tem certeza de que deseja continuar?',
      revoked: 'Token de acesso pessoal revogado com sucesso.',
    },
  },
  social: {
    linked: '{{connector}} vinculado com sucesso.',
    not_enabled:
      'Este método de login social não está habilitado. Entre em contato com seu administrador para obter ajuda.',
    removed: '{{connector}} removido com sucesso.',
    remove_confirmation_title: 'Remover conta social',
    remove_confirmation_description:
      'Se você remover {{connector}}, talvez não consiga entrar com essa conta até adicioná-la novamente.',
  },
  password: {
    title: 'Definir senha',
    description: 'Crie uma nova senha para proteger sua conta.',
    success: 'Senha atualizada com sucesso.',
  },
  code_verification: {
    send: 'Enviar código de verificação',
    resend: 'Ainda não recebeu? <a>Reenviar código de verificação</a>',
    resend_countdown: 'Ainda não recebeu? Reenvie após {{seconds}} s.',
  },
  email_verification: {
    email_label: 'Endereço de e-mail',
  },
  phone_verification: {
    phone_label: 'Número de telefone',
  },
  mfa: {
    totp_already_added:
      'Você já adicionou um aplicativo autenticador. Remova o existente primeiro.',
    totp_not_enabled:
      'O aplicativo autenticador OTP não está ativado. Entre em contato com seu administrador para obter ajuda.',
    backup_code_already_added:
      'Você já possui códigos de backup ativos. Use-os ou remova-os antes de gerar novos.',
    backup_code_not_enabled:
      'O código de backup não está ativado. Entre em contato com seu administrador para obter ajuda.',
    backup_code_requires_other_mfa:
      'Os códigos de backup exigem que outro método MFA seja configurado primeiro.',
    passkey_not_enabled:
      'Passkey não está ativado. Entre em contato com seu administrador para obter ajuda.',
    passkey_already_registered:
      'Esta passkey já está registrada na sua conta. Por favor, use um autenticador diferente.',
  },
  update_success: {
    default: {
      title: 'Atualizado!',
      description: 'Suas informações foram atualizadas.',
    },
    email: {
      title: 'E-mail atualizado!',
      description: 'Seu endereço de e-mail foi atualizado com sucesso.',
    },
    phone: {
      title: 'Número de telefone atualizado!',
      description: 'Seu número de telefone foi atualizado com sucesso.',
    },
    username: {
      title: 'Nome de usuário alterado!',
      description: 'Seu nome de usuário foi atualizado com sucesso.',
    },
    password: {
      title: 'Senha alterada!',
      description: 'Sua senha foi atualizada com sucesso.',
    },
    totp: {
      title: 'Aplicativo autenticador adicionado!',
      description: 'Seu aplicativo autenticador foi vinculado com sucesso à sua conta.',
    },
    totp_replaced: {
      title: 'Aplicativo autenticador substituído!',
      description: 'Seu aplicativo autenticador foi substituído com sucesso.',
    },
    backup_code: {
      title: 'Códigos de backup gerados!',
      description: 'Seus códigos de backup foram salvos. Mantenha-os em um local seguro.',
    },
    passkey: {
      title: 'Passkey adicionado!',
      description: 'Seu passkey foi vinculado com sucesso à sua conta.',
    },
    social: {
      title: 'Conta social vinculada!',
      description: 'Sua conta social foi vinculada com sucesso.',
    },
  },
  backup_code: {
    title: 'Códigos de backup',
    description:
      'Você pode usar um destes códigos de backup para acessar sua conta se tiver problemas durante a verificação em duas etapas de outra forma. Cada código só pode ser usado uma vez.',
    copy_hint: 'Certifique-se de copiá-los e salvá-los em um lugar seguro.',
    generate_new_title: 'Gerar novos códigos de backup',
    generate_new: 'Gerar novos códigos de backup',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Adicionado: {{date}}',
    last_used: 'Último uso: {{date}}',
    never_used: 'Nunca',
    unnamed: 'Passkey sem nome',
    renamed: 'Passkey renomeado com sucesso.',
    deleted: 'Passkey removido com sucesso.',
    add_another_title: 'Adicionar outro passkey',
    add_another_description:
      'Registre seu passkey usando biometria do dispositivo, chaves de segurança (ex: YubiKey) ou outros métodos disponíveis.',
    add_passkey: 'Adicionar um passkey',
    delete_confirmation_title: 'Remover sua passkey',
    delete_confirmation_description:
      'Se você remover esta passkey, não poderá mais usá-la para verificação.',
    rename_passkey: 'Renomear passkey',
    rename_description: 'Digite um novo nome para esta passkey.',
    name_this_passkey: 'Nomear esta passkey do dispositivo',
    name_passkey_description:
      'Você verificou este dispositivo com sucesso para autenticação em duas etapas. Personalize o nome para reconhecê-lo se tiver várias chaves.',
    name_input_label: 'Nome',
  },
  sessions: {
    page_title: 'Sessões',
    page_description: 'Gerencie suas sessões ativas e aplicativos de terceiros autorizados.',
    title: 'Sessões',
    current_session: 'Sessão atual',
    signed_in_at: 'Conectado em {{date}}',
    revoke_session: 'Sair',
    revoke_session_title: 'Encerrar sessão',
    revoke_session_description:
      'Isso encerrará a sessão e revogará todo o acesso associado. Tem certeza de que deseja continuar?',
    no_other_sessions: 'Nenhuma outra sessão ativa.',
    loading: 'Carregando...',
    third_party_apps_title: 'Apps de terceiros',
    no_third_party_apps: 'Nenhum aplicativo de terceiros autorizado.',
    third_party_apps_load_failed: 'Falha ao carregar apps de terceiros. Tente novamente.',
    granted_at: 'Autorizado em {{date}}',
    dynamic_app: 'Aplicativo dinâmico',
    client_id: 'ID do cliente: {{clientId}}',
    revoke_grant: 'Remover',
    revoke_grant_title: 'Remover acesso do app de terceiros',
    revoke_grant_description:
      'Isso revogará o acesso concedido a este aplicativo. Os tokens de acesso emitidos anteriormente podem permanecer válidos até expirarem. Tem certeza de que deseja continuar?',
    revoke_grant_failed: 'Falha ao revogar algumas permissões. Tente novamente.',
  },
};

export default Object.freeze(account_center);
