const errors = {
  something_went_wrong: 'Oops！何か問題が発生しました。',
  page_not_found: 'ページが見つかりません',
  unknown_server_error: '不明なサーバーエラーが発生しました',
  empty: 'データなし',
  missing_total_number: 'レスポンスヘッダーでTotal-Numberが見つかりません',
  invalid_uri_format: '無効なURI形式',
  invalid_origin_format: '無効なURIの起源の形式',
  invalid_json_format: '無効なJSON形式',
  invalid_regex: '無効な正規表現',
  invalid_error_message_format: 'エラーメッセージの形式が無効です。',
  required_field_missing: "'{{field}}'を入力してください",
  required_field_missing_plural: "少なくとも1つの'{{field}}'を入力する必要があります",
  more_details: '詳細を見る',
  username_pattern_error:
    'ユーザー名には、文字、数字、またはアンダースコアしか含めることができず、数字で始めることはできません。',
  email_pattern_error: 'メールアドレスが無効です。',
  phone_pattern_error: '電話番号が無効です。',
  insecure_contexts: '安全でないコンテキスト（ノンHTTP）はサポートされていません。',
  unexpected_error: '予期しないエラーが発生しました。',
  not_found: '404が見つかりません',
  create_internal_role_violation:
    '新しい内部ロールを作成しているため、Logtoによって禁止されています。 「#internal：」で始まらない別の名前を試してください。',
  should_be_an_integer: '整数である必要があります。',
  number_should_be_between_inclusive:
    "'{{min}}'から'{{max}}'（両方含む）までの数値である必要があります。",
};

export default Object.freeze(errors);
