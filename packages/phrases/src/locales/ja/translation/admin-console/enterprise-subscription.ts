const enterprise_subscription = {
  page_title: 'サブスクリプション',
  title: 'サブスクリプションを管理する',
  subtitle: 'これはあなたのマルチテナントサブスクリプションと請求履歴を管理するためのものです',
  tab: {
    subscription: 'サブスクリプション',
    billing_history: '請求履歴',
  },
  subscription: {
    title: 'サブスクリプション',
    description: '使用状況を簡単に追跡し、次の請求書を確認し、元の契約書をレビューできます。',
    enterprise_plan_title: 'エンタープライズプラン',
    enterprise_plan_description:
      'これはあなたのエンタープライズプランのサブスクリプションであり、このクォータはテナント間で共有されます。使用量の更新にはわずかな遅れが生じる可能性があります。',
    add_on_title: '従量課金の追加オプション',
    add_on_description:
      'これらは契約または Logto の標準従量課金率に基づく追加の従量課金オプションです。実際の使用量に応じて請求されます。',
    included: '含まれています',
    over_quota: 'クォータ超過',
    basic_plan_column_title: {
      product: '製品',
      usage: '使用量',
      quota: 'クォータ',
    },
    add_on_column_title: {
      product: '製品',
      unit_price: '単価',
      quantity: '数量',
      total_price: '合計',
    },
    add_on_sku_price: '${{price}}/月',
    private_region_title: 'プライベートクラウドインスタンス ({{regionName}})',
    shared_cross_tenants: 'テナント間で共有',
  },
  user_subscriptions: {
    description:
      '選択中のテナントに関係なく、個人サブスクリプションと Enterprise の契約枠を確認できます。',
    personal_title: '個人サブスクリプション',
    personal_description: '過去のものを含む、アカウントに請求されるサブスクリプションです。',
    enterprise_description:
      'Console SSO の利用枠は契約で定められ、権限を持つ管理者間で共有されます。個人サブスクリプションは別途請求されます。',
    allowance: '契約上限',
    quantity_price: '数量 × 単価',
    billing_period: '請求期間',
    connectors: 'Console SSO コネクター',
    no_connectors: 'コネクターなし',
    list_price_note:
      '表示単価に税金、割引、日割り調整は含まれません。次回の請求額や支払額ではありません。',
    proration_note:
      'Console SSO の追加・削除による日割り調整は通常の請求書で精算されます。最後の有料コネクターを削除すると、サブスクリプションが解約・精算されます。',
    overdue_note:
      '3 回連続の請求期間で未払いが続き、再試行が終了すると、料金徴収が一時停止され、有料 Console SSO コネクターが削除されます。支払い情報を更新しても設定は復元されません。サポートにお問い合わせください。',
    cancel_on: '{{date}} に解約予定',
    other_product: 'その他のサブスクリプション',
    status: {
      active: '有効',
      trialing: '試用中',
      past_due: '支払期限超過',
      unpaid: '未払い',
      canceled: '解約済み',
      incomplete: '未完了',
      incomplete_expired: '期限切れ',
      paused: '一時停止中',
    },
  },
};

export default Object.freeze(enterprise_subscription);
