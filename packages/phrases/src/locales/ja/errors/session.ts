const session = {
  not_found: 'セッションが見つかりません。戻って再度サインインしてください。',
  invalid_credentials: 'アカウントまたはパスワードが正しくありません。入力内容を確認してください。',
  invalid_sign_in_method: '現在のサインイン方法は利用できません。',
  invalid_connector_id: '利用可能なid {{connectorId}} のコネクタが見つかりません。',
  insufficient_info: '十分なサインイン情報がありません。',
  connector_id_mismatch: 'コネクタIDがセッションレコードと一致しません。',
  connector_session_not_found:
    'コネクタセッションが見つかりません。戻って再度サインインしてください。',
  verification_session_not_found:
    '検証が成功しませんでした。検証フローを再開してもう一度やり直してください。',
  verification_expired:
    '接続がタイムアウトしました。アカウントの安全性を確保するために再度検証してください。',
  verification_blocked_too_many_attempts:
    'Too many attempts in a short time. Please try again {{relativeTime}}.',
  unauthorized: '最初にサインインしてください。',
  unsupported_prompt_name: 'サポートされていないプロンプト名です。',
  forgot_password_not_enabled: 'パスワードを忘れた場合の対処が有効になっていません。',
  verification_failed: '検証が成功しませんでした。検証フローを再開してもう一度やり直してください。',
  connector_validation_session_not_found: 'トークン検証用のコネクタセッションが見つかりません。',
  identifier_not_found: 'ユーザーIDが見つかりません。戻って再度サインインしてください。',
  interaction_not_found:
    'インタラクションセッションが見つかりません。戻ってセッションを開始してください。',
  not_supported_for_forgot_password: 'This operation is not supported for forgot password.',
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
  sso_enabled:
    'このメールアドレスではシングルサインオンが有効になっています。SSOでサインインしてください。',
};

export default Object.freeze(session);
