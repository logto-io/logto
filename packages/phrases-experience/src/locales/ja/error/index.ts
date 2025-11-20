import password_rejected from './password-rejected.js';

const error = {
  general_required: `{{types, list(type: disjunction;)}}が必要です`,
  general_invalid: `{{types, list(type: disjunction;)}}が無効です`,
  invalid_min_max_input: '{{minValue}} と {{maxValue}} の間の値を入力してください',
  invalid_min_max_length:
    '入力値の長さは {{minLength}} から {{maxLength}} の間である必要があります',
  username_required: 'ユーザー名が必要です',
  password_required: 'パスワードが必要です',
  username_exists: 'ユーザー名が既に存在しています',
  username_should_not_start_with_number: 'ユーザー名は数字で始めることはできません',
  username_invalid_charset:
    'ユーザー名は文字、数字、またはアンダースコアのみを含める必要があります。',
  invalid_email: 'メールアドレスが無効です',
  invalid_phone: '電話番号が無効です',
  passwords_do_not_match: 'パスワードが一致しません。もう一度お試しください。',
  invalid_passcode: '検証コードが無効です。',
  invalid_connector_auth: '認証が無効です',
  invalid_connector_request: 'コネクターデータが無効です',
  unknown: '不明なエラーが発生しました。後でもう一度お試しください。',
  invalid_session: 'セッションが見つかりません。もう一度サインインしてください。',
  timeout: 'リクエストタイムアウト。後でもう一度お試しください。',
  password_rejected,
  sso_not_enabled: 'このメールアカウントではシングルサインオンが有効になっていません。',
  invalid_link: '無効なリンク',
  invalid_link_description: 'ワンタイムトークンの有効期限が切れているか、無効になっています。',
  captcha_verification_failed: 'キャプチャーの検証に失敗しました。',
  terms_acceptance_required: '利用規約の同意が必要です',
  terms_acceptance_required_description:
    '続行するには利用規約に同意する必要があります。もう一度お試しください。',
  something_went_wrong: '問題が発生しました。',
  feature_not_enabled: 'この機能は有効になっていません。',
};

export default Object.freeze(error);
