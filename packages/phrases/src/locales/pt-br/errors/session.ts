const session = {
  not_found: 'Sessão não encontrada. Volte e faça login novamente.',
  invalid_credentials: 'Credenciais inválidas. Verifique sua entrada.',
  invalid_sign_in_method: 'O método de login atual não está disponível.',
  invalid_connector_id: 'Não foi possível encontrar o conector disponível com id {{connectorId}}.',
  insufficient_info: 'Informações de login insuficientes.',
  connector_id_mismatch: 'O connectorId é incompatível com o registro da sessão.',
  connector_session_not_found: 'Sessão do conector não encontrada. Volte e faça login novamente.',
  verification_session_not_found:
    'A verificação não foi bem-sucedida. Reinicie o fluxo de verificação e tente novamente.',
  verification_expired:
    'A conexão expirou. Verifique novamente para garantir a segurança da sua conta.',
  verification_blocked_too_many_attempts:
    'Muitas tentativas em um curto período de tempo. Por favor, tente novamente {{relativeTime}}.',
  unauthorized: 'Faça login primeiro.',
  unsupported_prompt_name: 'Nome do prompt incompatível.',
  forgot_password_not_enabled: 'Esqueceu a senha não está ativado.',
  verification_failed:
    'A verificação não foi bem-sucedida. Reinicie o fluxo de verificação e tente novamente.',
  connector_validation_session_not_found:
    'A sessão de validação do token do conector não foi encontrada.',
  csrf_token_mismatch: 'Incompatibilidade de token CSRF.',
  identifier_not_found:
    'Identificador de usuário não encontrado. Por favor, volte e faça o login novamente.',
  interaction_not_found:
    'Sessão de interação não encontrada. Por favor, volte e inicie a sessão novamente.',
  invalid_interaction_type:
    'Esta operação não é suportada para a interação atual. Por favor, inicie uma nova sessão.',
  not_supported_for_forgot_password: 'Esta operação não é suportada para recuperação de senha.',
  identity_conflict:
    'Conflito de identidade detectado. Por favor, inicie uma nova sessão para prosseguir com uma identidade diferente.',
  identifier_not_verified:
    'O identificador fornecido {{identifier}} não foi verificado. Por favor, crie um registro de verificação para este identificador e complete o processo de verificação.',
  mfa: {
    require_mfa_verification: 'Verificação MFA é necessária para fazer login.',
    mfa_sign_in_only: 'MFA está disponível apenas para interação de login.',
    pending_info_not_found:
      'Informações MFA pendentes não encontradas, por favor inicie MFA primeiro.',
    invalid_totp_code: 'Código TOTP inválido.',
    webauthn_verification_failed: 'Falha na verificação do WebAuthn.',
    webauthn_verification_not_found: 'Verificação WebAuthn não encontrada.',
    bind_mfa_existed: 'MFA já existe.',
    backup_code_can_not_be_alone: 'O código de backup não pode ser o único MFA.',
    backup_code_required: 'O código de backup é obrigatório.',
    invalid_backup_code: 'Código de backup inválido.',
    mfa_policy_not_user_controlled: 'A política de MFA não é controlada pelo usuário.',
    mfa_factor_not_enabled: 'O fator MFA não está habilitado.',
    suggest_additional_mfa:
      'Para maior proteção, considere adicionar outro método de MFA. Você pode pular esta etapa e continuar.',
  },
  sso_enabled:
    'O login único está habilitado para este e-mail fornecido. Faça login com SSO, por favor.',
  captcha_required: 'Captcha é necessário.',
  captcha_failed: 'Falha na verificação do captcha.',
  email_blocklist: {
    disposable_email_validation_failed: 'Falha na validação do endereço de email.',
    invalid_email: 'Endereço de email inválido.',
    email_subaddressing_not_allowed: 'Subendereçamento de email não é permitido.',
    email_not_allowed:
      'O endereço de email "{{email}}" está restrito. Por favor, escolha um diferente.',
  },
  google_one_tap: {
    cookie_mismatch: 'Incompatibilidade de cookies do Google One Tap.',
    invalid_id_token: 'Token de ID do Google inválido.',
    unverified_email: 'Email não verificado.',
  },
};

export default Object.freeze(session);
