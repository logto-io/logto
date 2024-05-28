const webhooks = {
  page_title: 'Webhooks',
  title: 'Webhooks',
  subtitle: '特定のイベントに関するリアルタイムの更新を手軽に受け取るためにWebhookを作成します。',
  create: 'Webhookを作成する',
  schemas: {
    interaction: 'ユーザーインタラクション',
    user: 'ユーザー',
    organization: '組織',
    role: 'ロール',
    scope: '権限',
    organization_role: '組織の役割',
    organization_scope: '組織の権限',
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
      'POSTリクエストをエンドポイントURLに送信して、リアルタイムのアップデートを受け取るWebhookを作成します。 "アカウントを作成する"、"サインインする"、"パスワードをリセットする"などのイベントを受け取って、常に最新情報を把握しましょう。',
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
      'Enter the URL of your endpoint where a webhook’s payload is sent to when the event occurs.',
    create_webhook: 'Webhookを作成する',
    missing_event_error: '少なくとも1つのイベントを選択する必要があります。',
  },
  webhook_created: 'Webhook {{name}}が正常に作成されました。',
};

export default Object.freeze(webhooks);
