const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    '「利用規約」のコンテンツURLが空です。「利用規約」が有効になっている場合は、コンテンツURLを追加してください。',
  empty_social_connectors:
    '「ソーシャルサインイン」方式が有効な場合は、有効なソーシャルコネクタを追加してください。',
  enabled_connector_not_found: '{{type}}コネクタが見つかりません。',
  not_one_and_only_one_primary_sign_in_method:
    '主要なサインイン方式は1つだけにしてください。入力内容を確認してください。',
  username_requires_password:
    'ユーザー名のサインアップ識別子にはパスワードを設定する必要があります。',
  passwordless_requires_verify:
    'Eメール/電話番号サインアップ識別子には、検証を有効にする必要があります。',
  miss_sign_up_identifier_in_sign_in:
    'サインイン方式にはサインアップ識別子を含める必要があります。',
  password_sign_in_must_be_enabled:
    'サインアップ時にパスワードが必要な場合、パスワードサインインを有効にする必要があります。',
  code_sign_in_must_be_enabled:
    'サインアップ時にパスワードが不要な場合、検証コードサインインを有効にする必要があります。',
  unsupported_default_language: 'この言語- {{language}} は、現時点ではサポートされていません。',
  at_least_one_authentication_factor: '認証ファクタを1つ以上選択する必要があります。',
};

export default sign_in_experiences;
