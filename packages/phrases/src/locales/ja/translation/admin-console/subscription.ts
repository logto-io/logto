const subscription = {
  free_plan: '無料プラン',
  free_plan_description:
    'サイドプロジェクトや初期のLogtoトライアル向け。クレジットカードは不要です。',
  hobby_plan: 'ホビープラン',
  hobby_plan_description: '個人の開発者や開発環境向け。',
  pro_plan: 'プロプラン',
  pro_plan_description: 'Logtoを心配することなくビジネスを利益を得るためのプラン。',
  enterprise: 'エンタープライズ',
  current_plan: '現在のプラン',
  current_plan_description:
    'これは現在のプランです。プランの使用状況を表示したり、次の請求書を確認したり、より上位のプランにアップグレードしたりすることができます。',
  plan_usage: 'プランの使用状況',
  plan_cycle: 'プランのサイクル: {{period}}。使用量は{{renewDate}}にリセットされます。',
  next_bill: '次の請求書',
  next_bill_hint: '計算方法について詳しくは、この<a>記事</a>を参照してください。',
  next_bill_tip:
    '次回の請求書には、次の月のプランの基本価格と、各階層のMAU単価での使用量のコストが含まれます。',
  manage_payment: '支払いの管理',
  overfill_quota_warning:
    'クォータ上限に達しました。問題を防ぐためにプランをアップグレードしてください。',
  upgrade_pro: 'Proにアップグレード',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    '支払いにエラーが発生しました。前のサイクルの${{price, number}}の処理を行うことができません。Logtoサービスの一時停止を回避するために支払いを更新してください。',
  downgrade: 'ダウングレード',
  current: '現在',
  buy_now: '今すぐ購入',
  contact_us: 'お問い合わせ',
  quota_table: {
    quota: {
      title: 'クォータ',
      tenant_limit: 'テナント上限',
      base_price: '基本価格',
      mau_unit_price: '* MAU単価',
      mau_limit: 'MAU上限',
    },
    application: {
      title: 'アプリケーション',
      total: '総数',
      m2m: 'マシンとの通信',
    },
    resource: {
      title: 'APIリソース',
      resource_count: 'リソース数',
      scopes_per_resource: 'リソースごとの権限',
    },
    branding: {
      title: 'ブランディング',
      custom_domain: 'カスタムドメイン',
    },
    user_authn: {
      title: 'ユーザー認証',
      omni_sign_in: 'Omniサインイン',
      built_in_email_connector: '組み込みのメールコネクタ',
      social_connectors: 'ソーシャルコネクタ',
      standard_connectors: '標準コネクタ',
    },
    roles: {
      title: 'ロール',
      roles: 'ロール',
      scopes_per_role: 'ロールごとの権限',
    },
    audit_logs: {
      title: '監査ログ',
      retention: '保持期間',
    },
    hooks: {
      title: 'フック',
      amount: '金額',
    },
    support: {
      title: 'サポート',
      community: 'コミュニティ',
      customer_ticket: 'カスタマーチケット',
      premium: 'プレミアム',
    },
    mau_unit_price_footnote:
      '* ユニット価格は実際の消費リソースに基づいて異なる場合があり、Logtoはユニット価格に関する変更を説明する権利を留保します。',
    unlimited: '無制限',
    contact: 'お問い合わせ',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/月',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '{{count, number}} 日',
    days_other: '{{count, number}} 日',
    add_on: 'アドオン',
  },
  downgrade_form: {
    allowed_title: '本当にダウングレードしますか？',
    allowed_description: 'ダウングレードすると、以下の特典にアクセスできなくなります。',
    not_allowed_title: 'ダウングレードすることはできません',
    not_allowed_description:
      '以下の基準を満たしてから{{plan}}にダウングレードしてください。要件を調整して満たすと、ダウングレードが可能になります。',
    confirm_downgrade: 'とにかくダウングレード',
  },
};

export default subscription;
