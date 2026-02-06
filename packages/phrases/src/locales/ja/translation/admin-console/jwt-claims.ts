const jwt_claims = {
  title: 'カスタムJWT',
  description:
    'アクセストークンに含めるカスタムJWTクレームを設定します。これらのクレームを使用して、追加の情報をアプリケーションに渡すことができます。',
  description_with_id_token:
    'アクセストークンまたはIDトークンをカスタマイズして、アプリケーションに追加情報を提供します。',
  access_token: {
    card_title: 'アクセストークン',
    card_description:
      'アクセストークンは、APIがリクエストを承認するために使用する資格情報であり、アクセス決定に必要なクレームのみを含みます。',
  },
  user_jwt: {
    card_field: 'ユーザーアクセストークン',
    card_description: 'アクセストークン発行時にユーザー固有のデータを追加します。',
    for: 'ユーザー向け',
  },
  machine_to_machine_jwt: {
    card_field: 'マシン対マシンアクセストークン',
    card_description: 'マシン対マシントークン発行時に追加データを含めます。',
    for: 'M2M向け',
  },
  id_token: {
    card_title: 'IDトークン',
    card_description:
      'IDトークンはサインイン後に受け取る身元証明であり、クライアントが表示またはセッション作成に使用するユーザー識別クレームを含みます。',
    card_field: 'ユーザーIDトークン',
    card_field_description:
      '標準OIDCクレーム（例：sub、email、profile）は常に利用可能ですが、Logto定義のクレームはここで最初に有効にする必要があります。いずれの場合も、アプリ統合時に一致するスコープをリクエストして受信する必要があります。',
  },
  code_editor_title: 'カスタマイズ{{token}}クレーム',
  custom_jwt_create_button: 'カスタムクレームを追加',
  custom_jwt_item: 'カスタムクレーム{{for}}',
  delete_modal_title: 'カスタムクレームを削除',
  delete_modal_content: 'カスタムクレームを削除してもよろしいですか？',
  clear: 'クリア',
  cleared: 'クリアされた',
  restore: 'デフォルトに戻す',
  restored: '復元されました',
  data_source_tab: 'データソース',
  test_tab: 'コンテキストをテスト',
  jwt_claims_description: 'デフォルトクレームはJWTに自動的に含まれ、オーバーライドできません。',
  user_data: {
    title: 'ユーザーデータ',
    subtitle: '`context.user`入力パラメータを使用して重要なユーザー情報を提供します。',
  },
  grant_data: {
    title: 'グラントデータ',
    subtitle:
      '`context.grant`入力パラメータを使用して重要なグラント情報を提供します。これはトークン交換のためにのみ使用できます。',
  },
  interaction_data: {
    title: 'ユーザーインタラクションコンテキスト',
    subtitle:
      '`context.interaction` パラメーターを使用して、現在の認証セッションにおけるユーザーのインタラクション詳細にアクセスします。包含されるのは `interactionEvent`、`userId`、`verificationRecords` です。',
  },
  token_data: {
    title: 'トークンデータ',
    subtitle: '現在のアクセストークンペイロードに対して`token`入力パラメータを使用します。',
  },
  api_context: {
    title: 'API コンテキスト：アクセス制御',
    subtitle: '`api.denyAccess` メソッドを使用してトークンリクエストを拒否します。',
  },
  fetch_external_data: {
    title: '外部データを取得',
    subtitle: '外部APIからデータを直接クレームに組み込みます。',
    description: '`fetch`関数を使用して外部APIを呼び出し、データをカスタムクレームに含めます。例：',
  },
  environment_variables: {
    title: '環境変数を設定',
    subtitle: '機密情報を保存するために環境変数を使用します。',
    input_field_title: '環境変数を追加',
    sample_code: 'カスタムJWTクレームハンドラで環境変数にアクセスする方法。例：',
  },
  jwt_claims_hint:
    'カスタムクレームの制限は50KB未満です。デフォルトのJWTクレームは自動的にトークンに含まれ、オーバーライドできません。',
  tester: {
    subtitle: 'テストのためにモックトークンとユーザーデータを調整します。',
    run_button: 'テストを実行',
    result_title: 'テスト結果',
  },
  form_error: {
    invalid_json: '無効なJSON形式',
  },
};

export default Object.freeze(jwt_claims);
