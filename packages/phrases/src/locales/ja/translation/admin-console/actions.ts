const actions = {
  page_title: 'Actions',
  title: 'Actions',
  subtitle: '認証フローの特定のポイントでカスタムコードを実行し、Logto の動作を拡張します。',
  status: {
    not_configured: '未設定',
    configured: '設定済み',
    enabled: '有効',
    disabled: '無効',
  },
  types: {
    post_first_factor_verification: {
      name: '第1要素の検証後',
      description:
        'サインイン中にローカルパスワードの検証が失敗した後、カスタムロジックを実行します。',
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
    title: 'アクション結果',
    subtitle: 'このアクションタイプで Logto が理解できる結果オブジェクトを返します。',
  },
  environment_variables: {
    title: '環境変数を設定',
    subtitle: '機密情報を環境変数に保存します。',
    input_field_title: '環境変数を追加',
    sample_code: 'アクションハンドラーで環境変数にアクセスする例：',
  },
  fetch_external_data: {
    title: '外部データを取得',
    subtitle: 'アクションスクリプトから外部 API を呼び出します。',
    description: '`fetch` 関数で外部 API を呼び出し、データをアクション結果に含めます。例：',
  },
  settings: {
    title: '設定',
    subtitle: 'アクションの有効化とランタイムエラーの処理方法を制御します。',
    enabled: {
      title: 'アクションを有効化',
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
      'このアクションは、ローカルパスワードの検証が失敗した後にのみ実行されます。送信されたパスワードを別途検証した場合にのみ `passwordVerified: true` を返してください。このアクションでプロビジョニングされたユーザーは、メールブロックリスト、SSO 専用ドメイン、サインアップ無効モード、登録時の必須プロフィールチェックなど、登録専用の制限をバイパスします。既存ユーザーのプロフィールとパスワードの書き込みも、MFA 完了前に行われます。',
  },
  delete_modal_title: 'アクションを削除',
  delete_modal_content:
    'このアクションを削除してもよろしいですか？認証フローではこのスクリプトが実行されなくなります。',
  deleted: 'アクションを削除しました',
  created: 'アクションを作成しました',
  saved: 'アクションを保存しました',
};

export default Object.freeze(actions);
