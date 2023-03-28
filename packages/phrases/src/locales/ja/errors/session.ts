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
  unauthorized: '最初にサインインしてください。',
  unsupported_prompt_name: 'サポートされていないプロンプト名です。',
  forgot_password_not_enabled: 'パスワードを忘れた場合の対処が有効になっていません。',
  verification_failed: '検証が成功しませんでした。検証フローを再開してもう一度やり直してください。',
  connector_validation_session_not_found: 'トークン検証用のコネクタセッションが見つかりません。',
  identifier_not_found: 'ユーザーIDが見つかりません。戻って再度サインインしてください。',
  interaction_not_found:
    'インタラクションセッションが見つかりません。戻ってセッションを開始してください。',
};

export default session;
