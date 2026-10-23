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
    price: '価格',
    billing_period: '請求期間',
    list_price_note: '価格には税金と割引は含まれません。変更は次回の請求書で日割り計算されます。',
    overdue_note:
      '支払いが期限を過ぎています。未払いのままの場合、サブスクリプションが一時停止され、有料機能が削除されることがあります。',
    cancel_on: '{{date}} に解約予定',
    other_product: 'その他のサブスクリプション',
    enterprise_invoices_description:
      'Enterprise 契約の請求書です。請求書を選択すると、内容を確認し、請求書または領収書をダウンロードできます。',
    personal_invoices_description:
      '過去のものを含め、アカウントに請求されるサブスクリプションの請求書です。請求書を選択すると、内容を確認し、請求書または領収書をダウンロードできます。',
    credit_note:
      '削除や日割り計算によるクレジットは以降の請求書から差し引かれ、すぐにお支払い方法へ返金されるとは限りません。',
    invoice_link_unavailable:
      'この請求書のページは利用できません。コピーが必要な場合はお問い合わせください。',
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
