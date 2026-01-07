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
};

export default Object.freeze(enterprise_subscription);
