const single_sign_on = {
  forbidden_domains: 'パブリックメールドメインは許可されていません。',
  duplicated_domains: '重複するドメインがあります。',
  invalid_domain_format: 'ドメインの形式が無効です。',
  duplicate_connector_name: 'コネクタ名が既に存在します。別の名前を選択してください。',
  idp_initiated_authentication_not_supported:
    'IdP が開始する認証は SAML コネクタ専用でサポートされています。',
  idp_initiated_authentication_invalid_application_type:
    '無効なアプリケーションタイプです。{{type}} アプリケーションのみが許可されます。',
  idp_initiated_authentication_redirect_uri_not_registered:
    'redirect_uri は登録されていません。アプリケーション設定を確認してください。',
  idp_initiated_authentication_client_callback_uri_not_found:
    'クライアントの IdP 開始認証コールバック URI が見つかりません。コネクタ設定を確認してください。',
  sso_signing_unavailable:
    'ID プロバイダーでのサインインを完了できませんでした。管理者にお問い合わせください。',
  can_not_delete_active_signing_key:
    'アクティブな署名キーは削除できません。先に別のキーをアクティブにするか、このキーを非アクティブにしてください。',
  can_not_deactivate_signing_key_in_use:
    '署名付き認証リクエストが有効な間は、署名キーを非アクティブにできません。先に署名付き認証リクエストを無効にしてください。',
  active_signing_key_required:
    'アクティブな署名キーが見つかりません。署名付き認証リクエストを有効にする前に、署名キーを生成してアクティブにしてください。',
};

export default Object.freeze(single_sign_on);
