const session = {
  not_found: 'セッションが見つかりません。戻って再度サインインしてください。',
  invalid_credentials: 'アカウントまたはパスワードが正しくありません。入力内容を確認してください。',
  invalid_sign_in_method: '現在のサインイン方法は利用できません。',
  invalid_connector_id: '利用可能な id {{connectorId}} のコネクタが見つかりません。',
  insufficient_info: '十分なサインイン情報がありません。',
  connector_id_mismatch: 'コネクタIDがセッションレコードと一致しません。',
  connector_session_not_found:
    'コネクタセッションが見つかりません。戻って再度サインインしてください。',
  verification_session_not_found:
    '検証が成功しませんでした。検証フローを再開してもう一度やり直してください。',
  verification_expired:
    '接続がタイムアウトしました。アカウントの安全性を確保するために再度検証してください。',
  verification_blocked_too_many_attempts:
    '試行回数が多すぎます。{{relativeTime}}後に再度試してください。',
  unauthorized: '最初にサインインしてください。',
  unsupported_prompt_name: 'サポートされていないプロンプト名です。',
  forgot_password_not_enabled: 'パスワードを忘れた場合の対処が有効になっていません。',
  verification_failed: '検証が成功しませんでした。検証フローを再開してもう一度やり直してください。',
  connector_validation_session_not_found: 'トークン検証用のコネクタセッションが見つかりません。',
  csrf_token_mismatch: 'CSRF トークンの不一致。',
  identifier_not_found: 'ユーザー ID が見つかりません。戻って再度サインインしてください。',
  interaction_not_found:
    'インタラクションセッションが見つかりません。戻ってセッションを開始してください。',
  invalid_interaction_type:
    'この操作は現在のインタラクションではサポートされていません。新しいセッションを開始してください。',
  not_supported_for_forgot_password:
    'この操作は パスワードを忘れた 場合にはサポートされていません。',
  identity_conflict:
    'ID の不一致が検出されました。別の ID を使用して新しいセッションを開始してください。',
  identifier_not_verified:
    '指定された識別子 {{identifier}} は検証されていません。この識別子の検証記録を作成し、検証プロセスを完了してください。',
  mfa: {
    require_mfa_verification: 'サインインするには MFA 検証が必要です。',
    mfa_sign_in_only: 'MFA はサインイン操作のみに使用できます。',
    pending_info_not_found: '保留中の MFA 情報が見つかりません。まず MFA を開始してください。',
    invalid_totp_code: '無効な TOTP コード。',
    webauthn_verification_failed: 'WebAuthn 検証に失敗しました。',
    webauthn_verification_not_found: 'WebAuthn 検証が見つかりません。',
    bind_mfa_existed: 'MFA は既に存在します。',
    backup_code_can_not_be_alone: 'バックアップコードは唯一の MFA にはできません。',
    backup_code_required: 'バックアップコードが必要です。',
    invalid_backup_code: '無効なバックアップコード。',
    mfa_policy_not_user_controlled: 'MFA ポリシーはユーザーによって管理されていません。',
    mfa_factor_not_enabled: 'MFA は有効になっていません。',
    suggest_additional_mfa:
      'より強力な保護のため、別のMFA方法の追加を検討してください。この手順はスキップして続行できます。',
  },
  sso_enabled:
    'このメールアドレスではシングルサインオンが有効になっています。SSO でサインインしてください。',
  captcha_required: 'Captcha が必要です。',
  captcha_failed: 'Captcha 検証に失敗しました。',
  email_blocklist: {
    disposable_email_validation_failed: 'メールアドレスの検証に失敗しました。',
    invalid_email: '無効なメールアドレス。',
    email_subaddressing_not_allowed: 'メールのサブアドレッシングは許可されていません。',
    email_not_allowed:
      'メールアドレス "{{email}}" は制限されています。別のものを選択してください。',
  },
  google_one_tap: {
    cookie_mismatch: 'Google One Tap クッキーが一致しません。',
    invalid_id_token: '無効な Google ID トークン。',
    unverified_email: '未検証のメール。',
  },
};

export default Object.freeze(session);
