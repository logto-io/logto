const hook = {
  missing_events: '少なくとも1つのイベントを提供する必要があります。',
  send_test_payload_failed: 'テストペイロードの送信に失敗しました：{{message}}',
  endpoint_responded_with_error: 'エンドポイントがエラーで応答しました：{{message}}。',
  disabled: 'フックが無効になっているため、イベントを再配信できません。',
  log_not_permanently_failed: '完全に失敗した Webhook 配信のみ再配信できます。',
  invalid_log_payload:
    'Webhook ログエントリに再配信できる有効なリクエストペイロードが含まれていません。',
  redelivery_in_progress: 'この Webhook イベントの配信または再配信がすでに進行中です。',
};

export default Object.freeze(hook);
