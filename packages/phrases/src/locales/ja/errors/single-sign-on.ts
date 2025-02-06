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
};

export default Object.freeze(single_sign_on);
