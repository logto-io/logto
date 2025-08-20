const sign_in_experiences = {
  empty_content_url_of_terms_of_use:
    '「利用規約」のコンテンツ URL が空です。「利用規約」が有効になっている場合は、コンテンツ URL を追加してください。',
  empty_social_connectors:
    '「ソーシャルサインイン」方式が有効な場合は、有効なソーシャルコネクタを追加してください。',
  enabled_connector_not_found: '{{type}}コネクタが見つかりません。',
  not_one_and_only_one_primary_sign_in_method:
    '主要なサインイン方式は 1 つだけにしてください。入力内容を確認してください。',
  username_requires_password:
    'ユーザー名のサインアップ識別子にはパスワードを設定する必要があります。',
  passwordless_requires_verify:
    'E メール/電話番号サインアップ識別子には、検証を有効にする必要があります。',
  miss_sign_up_identifier_in_sign_in:
    'サインイン方式にはサインアップ識別子を含める必要があります。',
  password_sign_in_must_be_enabled:
    'サインアップ時にパスワードが必要な場合、パスワードサインインを有効にする必要があります。',
  code_sign_in_must_be_enabled:
    'サインアップ時にパスワードが不要な場合、検証コードサインインを有効にする必要があります。',
  unsupported_default_language: 'この言語- {{language}} は、現時点ではサポートされていません。',
  at_least_one_authentication_factor: '認証ファクタを 1 つ以上選択する必要があります。',
  backup_code_cannot_be_enabled_alone: 'バックアップコードは単独で有効にできません。',
  duplicated_mfa_factors: '重複した MFA ファクタです。',
  email_verification_code_cannot_be_used_for_mfa:
    'メール検証コードは、サインイン用にメール検証が有効になっている場合、MFA には使用できません。',
  phone_verification_code_cannot_be_used_for_mfa:
    'SMS 検証コードは、サインイン用に SMS 検証が有効になっている場合、MFA には使用できません。',
  email_verification_code_cannot_be_used_for_sign_in:
    'メール検証コードは、MFA に使用するために有効になっている場合、サインインには使用できません。',
  phone_verification_code_cannot_be_used_for_sign_in:
    'SMS 検証コードは、MFA に使用するために有効になっている場合、サインインには使用できません。',
  duplicated_sign_up_identifiers: '重複したサインアップ識別子が検出されました。',
  missing_sign_up_identifiers: '主要なサインアップ識別子を空にすることはできません。',
  invalid_custom_email_blocklist_format:
    '無効なカスタムメールブロックリスト項目: {{items, list(type:conjunction)}} 。各項目は有効なメールアドレスまたはメールドメインである必要があります。例: foo@example.com または @example.com 。',
  forgot_password_method_requires_connector:
    'パスワード忘れの方法には、対応する {{method}} コネクタの構成が必要です。',
};

export default Object.freeze(sign_in_experiences);
