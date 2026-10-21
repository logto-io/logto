const account_center = {
  home: {
    title: 'Página não encontrada',
    description: 'Esta página não está disponível.',
  },
  page: {
    title: 'Conta',
    security_title: 'Segurança',
    security_description: 'Altere aqui as definições da sua conta para garantir a sua segurança.',
    profile_title: 'Informações pessoais',
    profile_description: 'Altere as suas informações pessoais aqui.',
    sidebar_personal_info: 'Informações pessoais',
    sidebar_security: 'Segurança',
    sidebar_sessions: 'Sessões',
    support: 'Suporte',
    user_menu: 'Menu do utilizador',
    sign_out: 'Terminar sessão',
  },
  verification: {
    error_send_failed: 'Falha ao enviar o código de verificação. Tente novamente mais tarde.',
    error_invalid_code: 'O código de verificação é inválido ou expirou.',
    error_verify_failed: 'Falha na verificação. Introduza novamente o código.',
    step_up_not_completed:
      'A verificação de identidade não foi concluída. Não foram feitas alterações à sua conta.',
  },
  email: {
    title: 'Associar e-mail',
    description: 'Associe o seu e-mail para iniciar sessão ou ajudar na recuperação da conta.',
    verification_title: 'Introduza o código de verificação de e-mail',
    verification_description:
      'O código de verificação foi enviado para o seu e-mail {{email_address}}.',
    success: 'E-mail principal associado com sucesso.',
  },
  phone: {
    title: 'Associar número de telefone',
    description:
      'Associe o seu número de telefone para iniciar sessão ou ajudar na recuperação da conta.',
    verification_title: 'Introduza o código de verificação SMS',
    verification_description:
      'O código de verificação foi enviado para o seu telefone {{phone_number}}.',
    success: 'Telefone principal associado com sucesso.',
  },
  username: {
    title: 'Definir nome de utilizador',
    description: 'O nome de utilizador deve conter apenas letras, números e sublinhados.',
    policy_description: '{{requirements}}',
    success: 'Nome de utilizador atualizado com sucesso.',
  },
  security: {
    add: 'Adicionar',
    change: 'Alterar',
    remove: 'Remover',
    not_set: 'Não definido',
    social_sign_in: 'Início de sessão social',
    social_not_linked: 'Não associada',
    email_phone: 'E-mail / Telefone',
    email: 'E-mail',
    phone: 'Telefone',
    password: 'Palavra-passe',
    configured: 'Configurado',
    not_configured: 'Não configurado',
    two_step_verification: 'Verificação em dois passos',
    authenticator_app: 'Aplicação de autenticação',
    passkeys: 'Passkeys',
    backup_codes: 'Códigos de cópia de segurança',
    email_verification_code: 'Código de verificação por e-mail',
    phone_verification_code: 'Código de verificação por telefone',
    passkeys_count_one: '{{count}} passkey',
    passkeys_count_other: '{{count}} passkeys',
    backup_codes_count_one: '{{count}} código restante',
    backup_codes_count_other: '{{count}} códigos restantes',
    view: 'Ver',
    manage: 'Gerir',
    turn_on_2_step_verification_description:
      'Adicione uma camada extra de segurança. Será solicitada uma segunda etapa de verificação ao iniciar sessão.',
    turn_off_2_step_verification: 'Desativar verificação em duas etapas',
    turn_off_2_step_verification_description:
      'Desativar a verificação em duas etapas irá remover a camada extra de proteção da sua conta ao iniciar sessão. Tem a certeza de que pretende continuar?',
    disable_2_step_verification: 'Desativar',
    no_verification_method_warning:
      'Não adicionou um segundo método de verificação. Adicione pelo menos um para ativar a verificação em duas etapas ao iniciar sessão.',
    passkey_sign_in_prompt: 'Solicitar a configuração de uma passkey',
    passkey_sign_in_prompt_description:
      'Quando ativado, ser-lhe-á pedido para configurar uma passkey para um início de sessão mais rápido e seguro.',
    account_removal: 'Eliminação da conta',
    delete_your_account: 'Elimine a sua conta',
    delete_account: 'Eliminar conta',
    remove_username_confirmation_title: 'Remover nome de utilizador',
    remove_username_confirmation_description:
      'Após a remoção, deixará de poder iniciar sessão com este nome de utilizador. Tem a certeza de que pretende continuar?',
    remove_email_confirmation_title: 'Remover endereço de e-mail',
    remove_email_confirmation_description:
      'Após a remoção, deixará de poder iniciar sessão com este endereço de e-mail. Tem a certeza de que pretende continuar?',
    remove_phone_confirmation_title: 'Remover número de telefone',
    remove_phone_confirmation_description:
      'Após a remoção, deixará de poder iniciar sessão com este número de telefone. Tem a certeza de que pretende continuar?',
    email_removed: 'Endereço de e-mail removido com sucesso.',
    phone_removed: 'Número de telefone removido com sucesso.',
    username_removed: 'Nome de utilizador removido com sucesso.',
    trusted_devices: {
      title: 'Dispositivos fidedignos de MFA',
      current_device: 'Dispositivo atual',
      expires_on: 'Expira em {{date}}',
      unknown_location: 'Localização desconhecida',
      remove: 'Remover',
      removed: 'Dispositivo fidedigno removido com sucesso.',
      loading: 'A carregar...',
      empty: 'Nenhum dispositivo fidedigno.',
      load_failed: 'Falha ao carregar dispositivos fidedignos. Tente novamente.',
      retry: 'Tentar novamente',
      remove_confirmation_title: 'Remover dispositivo fidedigno?',
      remove_confirmation_description:
        'Terá de concluir novamente a MFA neste dispositivo da próxima vez que iniciar sessão. A sua sessão atual permanecerá ativa.',
    },
    personal_access_tokens: {
      title: 'Tokens de acesso pessoal',
      description:
        'Utilize tokens de acesso pessoal para se autenticar nas APIs em seu nome. Permanecem ativos até expirarem ou serem revogados, mesmo que termine a sessão ou altere a sua palavra-passe.',
      create: 'Criar novo token',
      created_at: 'Criado a {{date}}',
      expires_on: 'Expira a {{date}}',
      expired_on: 'Expirou a {{date}}',
      expired: 'Expirado',
      never_expires: 'Nunca expira',
      never_expires_warning:
        'Este token não tem data de expiração. Para maior segurança, crie um novo token com data de expiração e revogue este.',
      rename: 'Mudar nome',
      revoke: 'Revogar',
      loading: 'A carregar...',
      empty: 'Sem tokens de acesso pessoal.',
      load_failed: 'Falha ao carregar os tokens de acesso pessoal. Tente novamente.',
      retry: 'Tentar novamente',
      create_modal_title: 'Criar token de acesso pessoal',
      create_modal_description:
        'Atribua um nome descritivo ao seu token e escolha um período de expiração.',
      token_name: 'Nome do token',
      token_name_placeholder: 'O meu token',
      expiration: 'Expiração',
      expiration_days: '{{count}} dias',
      created_modal_title: 'Token de acesso pessoal criado',
      show_once_warning:
        'Não poderá voltar a ver este token. Copie-o agora e guarde-o num local seguro.',
      copied: 'Token de acesso pessoal copiado.',
      rename_modal_title: 'Mudar nome do token de acesso pessoal',
      rename_modal_description: 'Introduza um novo nome para este token de acesso pessoal.',
      renamed: 'Nome do token de acesso pessoal alterado com sucesso.',
      revoke_confirmation_title: 'Revogar token de acesso pessoal?',
      revoke_confirmation_description:
        'Quaisquer aplicações ou scripts que utilizem "{{name}}" perderão o acesso imediatamente. Tem a certeza de que pretende continuar?',
      revoked: 'Token de acesso pessoal revogado com sucesso.',
    },
  },
  social: {
    linked: '{{connector}} associada com sucesso.',
    not_enabled:
      'Este método de início de sessão social não está ativado. Contacte o seu administrador para obter ajuda.',
    removed: '{{connector}} removida com sucesso.',
    remove_confirmation_title: 'Remover conta social',
    remove_confirmation_description:
      'Se remover {{connector}}, poderá deixar de conseguir iniciar sessão com esta conta até a adicionar novamente.',
  },
  password: {
    title: 'Definir palavra-passe',
    description: 'Crie uma nova palavra-passe para proteger a sua conta.',
    success: 'Palavra-passe atualizada com sucesso.',
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
    totp_already_added: 'Já adicionou uma aplicação de autenticação. Remova a existente primeiro.',
    totp_not_enabled:
      'A aplicação de autenticação OTP não está ativa. Por favor, contacte o seu administrador para obter ajuda.',
    backup_code_already_added:
      'Já tem códigos de cópia de segurança ativos. Utilize-os ou remova-os antes de gerar novos.',
    backup_code_not_enabled:
      'O código de cópia de segurança não está ativado. Por favor, contacte o seu administrador para obter ajuda.',
    backup_code_requires_other_mfa:
      'Os códigos de cópia de segurança requerem que outro método MFA seja configurado primeiro.',
    passkey_not_enabled:
      'Passkey não está ativado. Por favor, contacte o seu administrador para obter ajuda.',
    passkey_already_registered:
      'Esta passkey já está registada na sua conta. Por favor, utilize um autenticador diferente.',
  },
  update_success: {
    default: {
      title: 'Atualizado!',
      description: 'Os seus dados foram atualizados.',
    },
    email: {
      title: 'E-mail atualizado!',
      description: 'O seu endereço de e-mail foi atualizado com sucesso.',
    },
    phone: {
      title: 'Número de telemóvel atualizado!',
      description: 'O seu número de telemóvel foi atualizado com sucesso.',
    },
    username: {
      title: 'Nome de utilizador alterado!',
      description: 'O seu nome de utilizador foi atualizado com sucesso.',
    },
    password: {
      title: 'Palavra-passe alterada!',
      description: 'A sua palavra-passe foi atualizada com sucesso.',
    },
    totp: {
      title: 'Aplicação de autenticação adicionada!',
      description: 'A sua aplicação de autenticação foi associada com sucesso à sua conta.',
    },
    totp_replaced: {
      title: 'Aplicativo autenticador substituído!',
      description: 'Seu aplicativo autenticador foi substituído com sucesso.',
    },
    backup_code: {
      title: 'Códigos de cópia de segurança gerados!',
      description:
        'Os seus códigos de cópia de segurança foram guardados. Guarde-os num local seguro.',
    },
    passkey: {
      title: 'Passkey adicionado!',
      description: 'O seu passkey foi associado com sucesso à sua conta.',
    },
    social: {
      title: 'Conta social associada!',
      description: 'A sua conta social foi associada com sucesso.',
    },
  },
  backup_code: {
    title: 'Códigos de cópia de segurança',
    description:
      'Pode utilizar um destes códigos de cópia de segurança para aceder à sua conta se tiver problemas durante a verificação em duas etapas de outra forma. Cada código só pode ser utilizado uma vez.',
    copy_hint: 'Certifique-se de os copiar e guardar num local seguro.',
    generate_new_title: 'Gerar novos códigos de cópia de segurança',
    generate_new: 'Gerar novos códigos de cópia de segurança',
  },
  passkey: {
    title: 'Passkeys',
    added: 'Adicionado: {{date}}',
    last_used: 'Última utilização: {{date}}',
    never_used: 'Nunca',
    unnamed: 'Passkey sem nome',
    renamed: 'Passkey renomeado com sucesso.',
    deleted: 'Passkey removido com sucesso.',
    add_another_title: 'Adicionar outro passkey',
    add_another_description:
      'Registe o seu passkey utilizando biometria do dispositivo, chaves de segurança (ex: YubiKey) ou outros métodos disponíveis.',
    add_passkey: 'Adicionar um passkey',
    delete_confirmation_title: 'Remover a sua passkey',
    delete_confirmation_description: 'Se remover esta passkey, não poderá usá-la para verificação.',
    rename_passkey: 'Renomear passkey',
    rename_description: 'Introduza um novo nome para esta passkey.',
    name_this_passkey: 'Nomear esta passkey do dispositivo',
    name_passkey_description:
      'Verificou este dispositivo com sucesso para autenticação em duas etapas. Personalize o nome para o reconhecer se tiver várias chaves.',
    name_input_label: 'Nome',
  },
  sessions: {
    page_title: 'Sessões',
    page_description: 'Gerir as suas sessões ativas e aplicações de terceiros autorizadas.',
    title: 'Sessões',
    current_session: 'Sessão atual',
    signed_in_at: 'Sessão iniciada em {{date}}',
    revoke_session: 'Terminar sessão',
    revoke_session_title: 'Terminar sessão',
    revoke_session_description:
      'Isto terminará a sessão e revogará todos os acessos associados. Tem a certeza de que pretende continuar?',
    no_other_sessions: 'Nenhuma outra sessão ativa.',
    loading: 'A carregar...',
    third_party_apps_title: 'Aplicações de terceiros',
    no_third_party_apps: 'Nenhuma aplicação de terceiros autorizada.',
    third_party_apps_load_failed: 'Falha ao carregar aplicações de terceiros. Tente novamente.',
    granted_at: 'Autorizado em {{date}}',
    dynamic_app: 'Aplicação dinâmica',
    client_id: 'ID de cliente: {{clientId}}',
    revoke_grant: 'Remover',
    revoke_grant_title: 'Remover acesso da aplicação de terceiros',
    revoke_grant_description:
      'Isto revogará o acesso concedido a esta aplicação. Os tokens de acesso emitidos anteriormente podem permanecer válidos até expirarem. Tem a certeza de que pretende continuar?',
    revoke_grant_failed: 'Falha ao revogar algumas permissões. Tente novamente.',
  },
};

export default Object.freeze(account_center);
