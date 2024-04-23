const jwt_claims = {
  title: 'カスタムJWT',
  description:
    'アクセストークンに含めるカスタムJWTクレームを設定します。これらのクレームを使用して、追加の情報をアプリケーションに渡すことができます。',
  user_jwt: {
    card_title: 'ユーザー向け',
    card_field: 'ユーザーアクセストークン',
    card_description: 'アクセストークン発行時にユーザー固有のデータを追加します。',
    for: 'ユーザー向け',
  },
  machine_to_machine_jwt: {
    card_title: 'M2M向け',
    card_field: 'マシン対マシントークン',
    card_description: 'マシン対マシントークン発行時に追加データを含めます。',
    for: 'M2M向け',
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
    subtitle: '`data.user`入力パラメータを使用して重要なユーザー情報を提供します。',
  },
  token_data: {
    title: 'トークンデータ',
    subtitle: '現在のアクセストークンペイロードに対して`token`入力パラメータを使用します。',
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
