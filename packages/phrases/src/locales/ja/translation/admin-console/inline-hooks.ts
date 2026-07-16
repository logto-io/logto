const inline_hooks = {
  page_title: 'インラインフック',
  title: 'インラインフック',
  subtitle: '認証フローの特定のポイントでカスタムコードを実行し、Logto の動作を拡張します。',
  details_page_title: '{{name}}',
  status: {
    not_configured: '未設定',
    configured: '設定済み',
    enabled: '有効',
    disabled: '無効',
  },
  hooks: {
    post_first_factor_verification: {
      name: '第1要素の検証後',
      description:
        '最初の認証要素が検証されてからサインインが続行されるまでの間に、カスタムロジックを実行します。',
    },
    post_sign_in: {
      name: 'サインイン後',
      description: 'ユーザーが正常にサインインした後に、カスタムロジックを実行します。',
    },
  },
  data_source_tab: 'データソース',
  test_tab: 'テストコンテキスト',
  settings_tab: '設定',
  event_data: {
    title: 'イベントペイロード',
    subtitle: '`event` 入力パラメーターで認証イベントデータを取得します。',
  },
  result_data: {
    title: 'フック結果',
    subtitle: 'このフックタイプで Logto が理解できる結果オブジェクトを返します。',
  },
  environment_variables: {
    title: '環境変数を設定',
    subtitle: '機密情報を環境変数に保存します。',
    input_field_title: '環境変数を追加',
    sample_code: 'インラインフックハンドラーで環境変数にアクセスする例：',
  },
  fetch_external_data: {
    title: '外部データを取得',
    subtitle: 'フックスクリプトから外部 API を呼び出します。',
    description: '`fetch` 関数で外部 API を呼び出し、データをフック結果に含めます。例：',
  },
  settings: {
    title: '設定',
    subtitle: 'フックの有効化とランタイムエラーの処理方法を制御します。',
    enabled: {
      title: 'フックを有効化',
      description: '認証イベントがトリガーされたときにこのスクリプトを実行します。',
    },
    on_execution_error: {
      title: 'スクリプトエラー時',
      description: 'スクリプトの実行に失敗したときの Logto の動作を選択します。',
      block: '認証フローをブロックする',
      allow: '認証フローの続行を許可する',
      post_first_factor_description:
        'このスクリプトが失敗した場合、Logto は常に無効な認証情報を拒否し、パスワード検証をバイパスできないようにします。',
    },
  },
  test_context: {
    subtitle: 'テスト実行時に使用するモックイベントペイロードを調整します。',
    input_field_title: 'イベントサンプル JSON',
  },
  script: {
    title: 'スクリプト',
    restore: 'デフォルトに戻す',
    restored: '復元しました',
  },
  tester: {
    run_button: 'テストを実行',
    result_title: 'テスト結果',
  },
  form_error: {
    invalid_json: '無効な JSON 形式',
  },
  security_warning: {
    title: 'セキュリティ警告',
    description:
      'このフックでプロビジョニングされたユーザーは、メールブロックリスト、SSO 専用ドメイン、サインアップ無効モード、登録時の必須プロフィールチェックなど、登録専用の制限をバイパスします。既存ユーザーのプロフィールとパスワードの書き込みも、MFA 完了前に行われます。',
  },
  delete_modal_title: 'インラインフックを削除',
  delete_modal_content:
    'このインラインフックを削除してもよろしいですか？認証フローではこのスクリプトが実行されなくなります。',
  deleted: 'インラインフックを削除しました',
  created: 'インラインフックを作成しました',
  saved: 'インラインフックを保存しました',
};

export default Object.freeze(inline_hooks);
