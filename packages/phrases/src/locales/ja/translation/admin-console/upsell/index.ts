import add_on from './add-on.js';
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
  token_exceeded_modal: {
    title: 'トークン使用量が制限を超えました。プランをアップグレードしてください。',
    notification:
      '<planName/> のトークン使用制限を超えました。ユーザーは Logto サービスに正しくアクセスできません。ご不便をおかけしないよう、すぐにプレミアムプランにアップグレードしてください。',
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
    tenant_member: 'テナントメンバー',
  },
  charge_notification_for_quota_limit:
    '{{item}} のクォータ制限を超えています。Logto はクォータ制限を超える利用に対して料金を追加します。新しいアドオン価格設計がリリースされる日から請求が開始されます。 <a>詳細</a>',
  paywall,
  featured_plan_content,
  add_on,
  convert_to_production_modal: {
    title: '開発テナントを本番テナントに変更しようとしています',
    description:
      '本番環境に移行する準備はできましたか？この開発テナントを本番テナントに変換すると、すべての機能が利用可能になります。',
    benefits: {
      stable_environment: 'エンドユーザー向け：実際の使用に安定した環境を提供。',
      keep_pro_features:
        'プロ機能を保持：プロプランに加入しようとしています。<a>プロ機能を見る。</a>',
      no_dev_restrictions:
        '開発制限なし：エンティティとリソースシステムの制限、およびサインインバナーを削除します。',
    },
    cards: {
      dev_description: 'テスト目的',
      prod_description: '実際の本番運用',
      convert_label: '変換',
    },
    button: '本番テナントに変換',
  },
};

export default Object.freeze(upsell);
