import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'プランをアップグレード',
  compare_plans: 'プラン比較',
  view_plans: 'プランを見る',
  create_tenant: {
    title: 'テナントプランを選択',
    description:
      '成長中の企業向けに革新的かつ手頃な価格で設計された競争力のあるプランオプションを提供しています。<a>詳細を見る</a>',
    base_price: '基本価格',
    monthly_price: '{{value, number}}/mo',
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
  add_on_quota_item: {
    api_resource: 'API リソース',
    machine_to_machine: 'マシン対マシンアプリケーション',
    tokens: '{{limit}}M トークン',
    /** UNTRANSLATED */
    tenant_member: 'tenant member',
  },
  charge_notification_for_quota_limit:
    '{{item}} のクォータ制限を超えています。Logto はクォータ制限を超える利用に対して料金を追加します。新しいアドオン価格設計がリリースされる日から請求が開始されます。 <a>詳細</a>',
  paywall,
  featured_plan_content,
};

export default Object.freeze(upsell);
