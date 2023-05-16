const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle:
    'Webhooksを使用すると、エンドポイントURLに特定のイベントのリアルタイム更新を提供して、即時反応を可能にします。',
  create: 'Webhookを作成する',
  events: {
    post_register: '新しいアカウントを作成する',
    post_sign_in: 'サインインする',
    post_reset_password: 'パスワードをリセットする',
  },
  table: {
    name: '名前',
    events: 'イベント',
    success_rate: '成功率（24時間）',
    requests: 'リクエスト（24時間）',
  },
  placeholder: {
    title: 'Webhook',
    description:
      'Webhooksを使用すると、エンドポイントURLに特定のイベントのリアルタイム更新を提供して、即時反応を可能にします。これにより、新しい情報を受け取った後、すぐにアクションを実行できるようになります。「新しいアカウントを作成する、サインインする、パスワードをリセットする」のイベントが現在サポートされています。',
    create_webhook: 'Webhookを作成する',
  },
  create_form: {
    title: 'Webhookを作成する',
    subtitle:
      'Webhookを追加して、エンドポイントURLにPOSTリクエストを送信し、ユーザーイベントの詳細を送信します。',
    events: 'イベント',
    events_description: 'LogtoがPOSTリクエストを送信するトリガーイベントを選択します。',
    name: '名前',
    name_placeholder: 'Webhook名を入力してください',
    endpoint_url: 'エンドポイントURL',
    endpoint_url_placeholder: 'https://your.webhook.endpoint.url',
    endpoint_url_tip:
      'イベントが発生したときに webhook ペイロードが送信されるエンドポイントの HTTPS URLを入力します。',
    create_webhook: 'Webhookを作成する',
    missing_event_error: '少なくとも1つのイベントを選択する必要があります。',
    https_format_error: 'セキュリティ上の理由からHTTPS形式が必要です。',
    block_description:
      '現在のバージョンでは、最大3個の Webhook にしか対応していません。追加の webhook が必要な場合は、サポートチーム <a>{{link}}</a> までご連絡ください。',
  },
  webhook_created: 'Webhook {{name}}が正常に作成されました。',
};

export default webhooks;
