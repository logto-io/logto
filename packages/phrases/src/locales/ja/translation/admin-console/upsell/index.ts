import paywall from './paywall.js';

const upsell = {
  pro_tag: 'プロ',
  upgrade_plan: 'プランをアップグレード',
  compare_plans: 'プラン比較',
  get_started: {
    title: '無料プランでスムーズなアイデンティティの旅を始めましょう！',
    description:
      '無料プランは、サイドプロジェクトやトライアルでのLogtoの試用に最適です。チームにLogtoの機能を最大限に活用するには、アップグレードしてプレミアム機能への無制限アクセスを獲得してください：無制限のMAU利用、マシン間統合、RBAC管理、長期間の監査ログなど。<a>すべてのプランを表示</a>',
  },
  create_tenant: {
    title: 'テナントプランを選択',
    description:
      '成長中の企業向けに革新的かつ手頃な価格で設計された競争力のあるプランオプションを提供しています。<a>詳細を見る</a>',
    base_price: '基本価格',
    monthly_price: '{{value, number}}/mo',
    mau_unit_price: 'MAU単価',
    view_all_features: 'すべての機能を見る',
    select_plan: '<name/>を選択',
    free_tenants_limit: '最大{{count, number}}テナント無料',
    free_tenants_limit_other: '最大{{count, number}}テナント無料',
    most_popular: '最も人気',
    upgrade_success: '<name/>にアップグレードしました',
  },
  mau_exceeded_modal: {
    title: 'MAUが制限を超えました。プランをアップグレードしてください。',
    notification:
      '現在のMAUが<planName/>の制限を超えています。サービスの停止を回避するために、迅速にプレミアムプランにアップグレードしてください。',
    update_plan: 'プランを更新',
  },
  payment_overdue_modal: {
    title: '請求書の支払いが期限切れです',
    notification:
      'おっと！テナント<span>{{name}}</span>の請求書の支払いが失敗しました。Logtoサービスの停止を避けるために、すみやかに請求書をお支払いください。',
    unpaid_bills: '未払いの請求書',
    update_payment: '支払いを更新',
  },
  paywall,
};

export default Object.freeze(upsell);
