const session = {
  not_found: 'Session not found. Please go back and sign in again.',
  invalid_credentials: 'Incorrect account or password. Please check your input.',
  invalid_sign_in_method: 'Current sign-in method is not available.',
  invalid_connector_id: 'Unable to find available connector with id {{connectorId}}.',
  insufficient_info: 'Insufficient sign-in info.',
  connector_id_mismatch: 'The connectorId is mismatched with session record.',
  connector_session_not_found: 'Connector session not found. Please go back and sign in again.',
  verification_session_not_found:
    'The verification was not successful. Restart the verification flow and try again.',
  verification_expired: 'The connection has timed out. Verify again to ensure your account safety.',
  verification_blocked_too_many_attempts:
    'Too many attempts in a short time. Please try again {{relativeTime}}.',
  unauthorized: 'Please sign in first.',
  unsupported_prompt_name: 'Unsupported prompt name.',
  forgot_password_not_enabled: 'Forgot password is not enabled.',
  verification_failed:
    'The verification was not successful. Restart the verification flow and try again.',
  connector_validation_session_not_found:
    'The connector session for token validation is not found.',
  csrf_token_mismatch: 'CSRF token mismatch.',
  identifier_not_found: 'User identifier not found. Please go back and sign in again.',
  interaction_not_found:
    'Interaction session not found. Please go back and start the session again.',
  not_supported_for_forgot_password: 'This operation is not supported for forgot password.',
  identity_conflict:
    'Identity mismatch detected. Please initiate a new session to proceed with a different identity.',
  mfa: {
    require_mfa_verification: 'Mfa verification is required to sign in.',
    mfa_sign_in_only: 'Mfa is only available for sign-in interaction.',
    pending_info_not_found: 'Pending MFA info not found, please initiate MFA first.',
    invalid_totp_code: 'Invalid TOTP code.',
    webauthn_verification_failed: 'WebAuthn verification failed.',
    webauthn_verification_not_found: 'WebAuthn verification not found.',
    bind_mfa_existed: 'MFA already exists.',
    backup_code_can_not_be_alone: 'Backup code can not be the only MFA.',
    backup_code_required: 'Backup code is required.',
    invalid_backup_code: 'Invalid backup code.',
    mfa_policy_not_user_controlled: 'MFA policy is not user controlled.',
  },
  sso_enabled: 'Single sign on is enabled for this given email. Please sign in with SSO.',
};

export default Object.freeze(session);
