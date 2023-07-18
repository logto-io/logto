const upsell = {
  pro_tag: 'プロ',
  upgrade_plan: 'プランをアップグレード',
  compare_plans: 'プラン比較',
  contact_us: 'お問い合わせ',
  get_started: {
    title: 'シームレスなアイデンティティの旅を<planName/>で始めよう！',
    description:
      '<planName/>は、サイドプロジェクトや試用に最適です。チームのニーズに合わせて、アップグレードしてプレミアム機能を無制限で利用しましょう：無制限のMAU使用、マシン・ツー・マシンの統合、シームレスなRBAC管理、長期の監査ログなど。',
    view_plans: 'プランを見る',
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
    upgrade_to: '<name/>にアップグレード',
    free_tenants_limit: '最大{{count, number}}テナント無料',
    free_tenants_limit_other: '最大{{count, number}}テナント無料',
    most_popular: '最も人気',
    upgrade_success: '<name/>にアップグレードしました',
  },
  paywall: {
    applications:
      '{{count, number}}の<planName/>アプリケーション制限に達しました。チームのニーズに合わせて有料プランにアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    applications_other:
      '{{count, number}}の<planName/>アプリケーション制限に達しました。チームのニーズに合わせて有料プランにアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    machine_to_machine_feature:
      '有料プランにアップグレードして、マシン・ツー・マシンのアプリケーションを作成し、すべてのプレミアム機能にアクセスしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    machine_to_machine:
      '{{count, number}}の<planName/>マシン・ツー・マシンのアプリケーション制限に達しました。チームのニーズに合わせて有料プランにアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    machine_to_machine_other:
      '{{count, number}}の<planName/>マシン・ツー・マシンのアプリケーション制限に達しました。チームのニーズに合わせて有料プランにアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    resources:
      '{{count, number}}の<planName/> APIリソース制限に達しました。チームのニーズに合わせてプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    resources_other:
      '{{count, number}}の<planName/> APIリソース制限に達しました。チームのニーズに合わせてプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    scopes_per_resource:
      '{{count, number}}の<planName/> APIリソースあたりの許可制限に達しました。拡張するには今すぐアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    scopes_per_resource_other:
      '{{count, number}}の<planName/> APIリソースあたりの許可制限に達しました。拡張するには今すぐアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    custom_domain:
      'カスタムドメインの機能を利用するには、有料プランにアップグレードしてください。お手伝いが必要な場合は、<a>お問い合わせ</a>ください。',
    social_connectors:
      '{{count, number}}の<planName/>ソーシャルコネクタ制限に達しました。チームのニーズに合わせて有料プランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    social_connectors_other:
      '{{count, number}}の<planName/>ソーシャルコネクタ制限に達しました。チームのニーズに合わせて有料プランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    standard_connectors_feature:
      'OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成するには有料プランにアップグレードし、無制限のソーシャルコネクタとすべてのプレミアム機能にアクセスしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    standard_connectors:
      '{{count, number}}の<planName/>ソーシャルコネクタ制限に達しました。チームのニーズに合わせて有料プランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    standard_connectors_other:
      '{{count, number}}の<planName/>ソーシャルコネクタ制限に達しました。チームのニーズに合わせて有料プランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    standard_connectors_pro:
      '{{count, number}}の<planName/>スタンダードコネクタ制限に達しました。チームのニーズに合わせてエンタープライズプランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    standard_connectors_pro_other:
      '{{count, number}}の<planName/>スタンダードコネクタ制限に達しました。チームのニーズに合わせてエンタープライズプランにアップグレードして、OIDC、OAuth 2.0、およびSAMLプロトコルを使用して独自のコネクタを作成できるようにしましょう。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    roles:
      '{{count, number}}の<planName/>ロール制限に達しました。追加のロールと権限を追加するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    roles_other:
      '{{count, number}}の<planName/>ロール制限に達しました。追加のロールと権限を追加するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    scopes_per_role:
      '{{count, number}}の<planName/>ロールあたりの許可制限に達しました。追加のロールと権限を追加するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    scopes_per_role_other:
      '{{count, number}}の<planName/>ロールあたりの許可制限に達しました。追加のロールと権限を追加するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    hooks:
      '{{count, number}}の<planName/>ウェブフック制限に達しました。追加のウェブフックを作成するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
    hooks_other:
      '{{count, number}}の<planName/>ウェブフック制限に達しました。追加のウェブフックを作成するにはプランをアップグレードしてください。<a>お問い合わせ</a>は何かお手伝いが必要な場合はお気軽にどうぞ。',
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
      'おっと！テナント{{name}}の請求書の支払いが前回のサイクルで失敗しました。サービスの停止を回避するために、迅速に請求書をお支払いください。',
    unpaid_bills_last_cycle: '前回のサイクルの未払い請求書',
    update_payment: '支払いを更新',
  },
};

export default upsell;
