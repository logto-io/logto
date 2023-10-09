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
  identifier_not_found: 'User identifier not found. Please go back and sign in again.',
  interaction_not_found:
    'Interaction session not found. Please go back and start the session again.',
  not_supported_for_forgot_password: 'This operation is not supported for forgot password.',
  mfa: {
    require_mfa_verification: 'Mfa verification is required to sign in.',
    mfa_sign_in_only: 'Mfa is only available for sign-in interaction.',
    pending_info_not_found: 'Pending MFA info not found, please initiate MFA first.',
    invalid_totp_code: 'Invalid TOTP code.',
    webauthn_verification_failed: 'WebAuthn verification failed.',
  },
};

export default Object.freeze(session);
