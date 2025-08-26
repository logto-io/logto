const session = {
  not_found: 'Sessão não encontrada. Por favor, volte e faça login novamente.',
  invalid_credentials: 'Credenciais inválidas. Por favor, verifique os dados.',
  invalid_sign_in_method: 'O método de login atual não está disponível.',
  invalid_connector_id:
    'Não foi possível encontrar um conector disponível com o id {{connectorId}}.',
  insufficient_info: 'Informações de login insuficientes.',
  connector_id_mismatch: 'O connectorId não corresponde ao registado na sessão.',
  connector_session_not_found:
    'Sessão do conector não encontrada. Por favor, volte e faça login novamente.',
  verification_session_not_found:
    'A verificação não foi bem-sucedida. Reinicie o processo de verificação e tente novamente.',
  verification_expired:
    'A conexão expirou. Verifique novamente para garantir a segurança de sua conta.',
  verification_blocked_too_many_attempts:
    'Muitas tentativas em um curto período de tempo. Por favor, tente novamente {{relativeTime}}.',
  unauthorized: 'Faça login primeiro.',
  unsupported_prompt_name: 'Nome de prompt não suportado.',
  forgot_password_not_enabled: 'Recuperação de senha não está habilitada.',
  verification_failed:
    'A verificação não foi bem-sucedida. Reinicie o processo de verificação e tente novamente.',
  connector_validation_session_not_found:
    'A sessão do conector para validação do token não foi encontrada.',
  csrf_token_mismatch: 'Incompatibilidade de token CSRF.',
  identifier_not_found:
    'Identificador do usuário não encontrado. Por favor, volte e faça login novamente.',
  interaction_not_found:
    'Sessão de interação não encontrada. Por favor, volte e inicie a sessão novamente.',
  invalid_interaction_type:
    'Esta operação não é suportada para a interação atual. Por favor, inicie uma nova sessão.',
  not_supported_for_forgot_password: 'Esta operação não é suportada para recuperação de senha.',
  identity_conflict:
    'Conflito de identidade detetado. Por favor, inicie uma nova sessão para continuar com uma identidade diferente.',
  identifier_not_verified:
    'O identificador fornecido {{identifier}} não foi verificado. Por favor, crie um registo de verificação para este identificador e complete o processo de verificação.',
  mfa: {
    require_mfa_verification: 'Verificação MFA é necessária para efetuar login.',
    mfa_sign_in_only: 'MFA está disponível apenas para interação de login.',
    pending_info_not_found:
      'Informações de MFA pendentes não encontradas, por favor, inicie o MFA primeiro.',
    invalid_totp_code: 'Código TOTP inválido.',
    webauthn_verification_failed: 'A verificação WebAuthn falhou.',
    webauthn_verification_not_found: 'Verificação WebAuthn não encontrada.',
    bind_mfa_existed: 'MFA já existe.',
    backup_code_can_not_be_alone: 'O código de backup não pode ser o único MFA.',
    backup_code_required: 'O código de backup é necessário.',
    invalid_backup_code: 'Código de backup inválido.',
    mfa_policy_not_user_controlled: 'A política MFA não é controlada pelo usuário.',
    mfa_factor_not_enabled: 'O fator MFA não está ativado.',
    suggest_additional_mfa:
      'Para maior proteção, considere adicionar outro método de MFA. Pode ignorar este passo e continuar.',
  },
  sso_enabled:
    'O login único está habilitado para este e-mail fornecido. Faça login com SSO, por favor.',
  captcha_required: 'O Captcha é necessário.',
  captcha_failed: 'Falha na verificação do Captcha.',
  email_blocklist: {
    disposable_email_validation_failed: 'A validação do endereço de email falhou.',
    invalid_email: 'Endereço de email inválido.',
    email_subaddressing_not_allowed: 'O redirecionamento de email não é permitido.',
    email_not_allowed:
      'O endereço de email "{{email}}" é restrito. Por favor, escolha um diferente.',
  },
  google_one_tap: {
    cookie_mismatch: 'Incompatibilidade do cookie do Google One Tap.',
    invalid_id_token: 'Token de ID do Google inválido.',
    unverified_email: 'Email não verificado.',
  },
};

export default Object.freeze(session);
