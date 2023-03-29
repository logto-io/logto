const application_details = {
  page_title: 'Application details', // UNTRANSLATED
  back_to_applications: 'アプリケーションに戻る',
  check_guide: 'ガイドを確認',
  settings: '設定',
  settings_description:
    'アプリケーションは、Logto for OIDC、サインインエクスペリエンス、監査ログなどでアプリケーションを識別するために使用されます。',
  advanced_settings: '高度な設定',
  advanced_settings_description:
    '高度な設定にはOIDC関連用語が含まれます。詳細については、トークンエンドポイントを確認してください。',
  application_name: 'アプリケーション名',
  application_name_placeholder: '私のアプリ',
  description: '説明',
  description_placeholder: 'アプリケーションの説明を入力してください',
  authorization_endpoint: '認可エンドポイント',
  authorization_endpoint_tip:
    '認証と認可を実行するエンドポイントです。 OpenID Connectの<a>認証</a>に使用されます。',
  application_id: 'アプリID',
  application_id_tip:
    '通常Logtoによって生成される一意のアプリケーション識別子です。 OpenID Connectでは「<a>client_id</a>」とも呼ばれます。',
  application_secret: 'アプリのシークレット',
  redirect_uri: 'リダイレクトURI',
  redirect_uris: 'リダイレクトURI',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'ユーザーがサインイン（成功した場合も失敗した場合も）した後にリダイレクトされるURIです。詳細については、OpenID Connectの<a>AuthRequest</a>を参照してください。',
  post_sign_out_redirect_uri: 'サインアウト後のリダイレクトURI',
  post_sign_out_redirect_uris: 'サインアウト後のリダイレクトURI',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    'ユーザーのサインアウト後にリダイレクトされるURIです（オプション）。一部のアプリケーションタイプでは実質的な効果がない可能性があります。',
  cors_allowed_origins: 'CORS許可されたオリジン',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    'デフォルトでは、リダイレクトURIのすべてのオリジンが許可されます。通常、このフィールドでは何も行動を必要としません。これについての詳細情報は<a>MDN doc</a>を参照してください。',
  id_token_expiration: 'IDトークンの有効期限',
  refresh_token_expiration: 'リフレッシュトークンの有効期限',
  token_endpoint: 'トークンエンドポイント',
  user_info_endpoint: 'ユーザー情報エンドポイント',
  enable_admin_access: '管理者アクセスを有効にする',
  enable_admin_access_label:
    '管理APIへのアクセスを有効または無効にします。有効にすると、アクセストークンを使用してこのアプリケーションを代表して管理APIを呼び出すことができます。',
  delete_description:
    'この操作は元に戻すことはできません。アプリケーション名「<span>{{name}}</span>」を入力して確認してください。',
  enter_your_application_name: 'アプリケーション名を入力してください',
  application_deleted: 'アプリケーション{{name}}が正常に削除されました',
  redirect_uri_required: 'リダイレクトURIを少なくとも1つ入力する必要があります',
};

export default application_details;
