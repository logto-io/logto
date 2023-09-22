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
  /** UNTRANSLATED */
  verification_blocked_too_many_attempts:
    'Too many attempts in a short time. Please try again {{relativeTime}}.',
  unauthorized: 'Faça login primeiro.',
  unsupported_prompt_name: 'Prompt name incompatível.',
  forgot_password_not_enabled: 'Esqueceu a senha não está ativado.',
  verification_failed:
    'A verificação não foi bem-sucedida. Reinicie o fluxo de verificação e tente novamente.',
  connector_validation_session_not_found:
    'A sessão de validação do token do conector não foi encontrada.',
  identifier_not_found:
    'Identificador de usuário não encontrado. Por favor, volte e faça o login novamente.',
  interaction_not_found:
    'Sessão de interação não encontrada. Por favor, volte e inicie a sessão novamente.',
  mfa: {
    /** UNTRANSLATED */
    require_mfa_verification: 'Mfa verification is required to sign in.',
    /** UNTRANSLATED */
    mfa_sign_in_only: 'Mfa is only available for sign-in interaction.',
    /** UNTRANSLATED */
    pending_info_not_found: 'Pending MFA info not found, please initiate MFA first.',
    /** UNTRANSLATED */
    invalid_totp_code: 'Invalid TOTP code.',
  },
};

export default Object.freeze(session);
