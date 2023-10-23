const webhook_details = {
  page_title: 'Webhookの詳細',
  back_to_webhooks: 'Webhooksに戻る',
  not_in_use: '使用されていない',
  success_rate: '成功率',
  requests: '24時間に{{value, number}}件のリクエスト',
  disable_webhook: 'Webhookを無効にする',
  disable_reminder:
    '本当にこのWebhookを再度アクティブにしますか？これを行うとエンドポイントURLにHTTPリクエストが送信されなくなります。',
  webhook_disabled: 'Webhookは無効になりました。',
  webhook_reactivated: 'Webhookが再度有効になりました。',
  reactivate_webhook: 'Webhookを再度アクティブにする',
  delete_webhook: 'Webhookを削除する',
  deletion_reminder:
    'このWebhookを削除しています。削除した後はエンドポイントURLにHTTPリクエストが送信されなくなります。',
  deleted: 'Webhookは削除されました。',
  settings_tab: '設定',
  recent_requests_tab: '最近のリクエスト（24時間）',
  settings: {
    settings: '設定',
    settings_description:
      'Webhookは、特定のイベントが発生すると、POSTリクエストをエンドポイントURLに送信することで、リアルタイムのアップデートを受信できるようにするものです。これにより、新しい情報を受信した後、直ちにアクションを起こすことができます。',
    events: 'イベント',
    events_description: 'LogtoがPOSTリクエストを送信するトリガーイベントを選択します。',
    name: '名前',
    endpoint_url: 'エンドポイントURL',
    signing_key: '署名キー',
    signing_key_tip:
      'ログトから提供されたシークレットキーをエンドポイントにリクエストヘッダーとして追加して、Webhookのペイロードの正当性を保証します。',
    regenerate: '再生成する',
    regenerate_key_title: '署名キーの再生成',
    regenerate_key_reminder:
      '署名キーを変更してもよろしいですか？再生成すると、すぐに有効になります。エンドポイントに同期して署名キーを変更することを忘れないでください。',
    regenerated: '署名キーが再生成されました。',
    custom_headers: 'カスタムヘッダー',
    custom_headers_tip:
      'オプションで、Webhookのペイロードに追加のコンテキストまたはメタデータを提供するために、カスタムヘッダーを追加できます。',
    key_duplicated_error: 'キーは繰り返すことはできません。',
    key_missing_error: 'キーは必須です。',
    value_missing_error: '値が必要です。',
    invalid_key_error: 'キーが無効です',
    invalid_value_error: '値が無効です',
    test: 'テスト',
    test_webhook: 'Webhookをテストする',
    test_webhook_description:
      'Webhookを設定し、各選択したイベントのペイロード例を使用してテストして、正しい受信と処理を確認してください。',
    send_test_payload: 'テストペイロードを送信する',
    test_result: {
      endpoint_url: 'エンドポイントURL：{{url}}',
      message: 'メッセージ：{{message}}',
      response_status: 'レスポンスステータス：{{status, number}}',
      response_body: 'レスポンスボディ：{{body}}',
      request_time: 'リクエスト時間：{{time}}',
      test_success: 'エンドポイントへのWebhookテストは成功しました。',
    },
  },
};

export default Object.freeze(webhook_details);
