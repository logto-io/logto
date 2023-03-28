const error = {
  general_required: `{{types, list(type: disjunction;)}}が必要です`,
  general_invalid: `{{types, list(type: disjunction;)}}が無効です`,
  username_required: 'ユーザー名が必要です',
  password_required: 'パスワードが必要です',
  username_exists: 'ユーザー名が既に存在しています',
  username_should_not_start_with_number: 'ユーザー名は数字で始めることはできません',
  username_invalid_charset:
    'ユーザー名は文字、数字、またはアンダースコアのみを含める必要があります。',
  invalid_email: 'メールアドレスが無効です',
  invalid_phone: '電話番号が無効です',
  password_min_length: 'パスワードは{{min}}文字以上である必要があります',
  invalid_password:
    'パスワードは{{min}}文字以上で、文字、数字、および記号の組み合わせである必要があります。',
  passwords_do_not_match: 'パスワードが一致しません。もう一度お試しください。',
  invalid_passcode: '検証コードが無効です',
  invalid_connector_auth: '認証が無効です',
  invalid_connector_request: 'コネクターデータが無効です',
  unknown: '不明なエラーが発生しました。後でもう一度お試しください。',
  invalid_session: 'セッションが見つかりません。もう一度サインインしてください。',
  timeout: 'リクエストタイムアウト。後でもう一度お試しください。',
};

export default error;
