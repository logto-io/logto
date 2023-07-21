import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'フリープラン',
  free_plan_description:
    'サイドプロジェクトや最初のLogtoのトライアルに適しています。クレジットカードは必要ありません。',
  hobby_plan: 'ホビープラン',
  hobby_plan_description: '個人の開発者や開発環境に適しています。',
  pro_plan: 'プロプラン',
  pro_plan_description: 'ビジネスが安心してLogtoを利用できるプランです。',
  enterprise: 'エンタープライズ',
  current_plan: '現在のプラン',
  current_plan_description:
    'これはあなたの現在のプランです。プランの使用状況を確認し、次の請求書を表示し、必要であればより高いティアのプランにアップグレードすることができます。',
  plan_usage: '利用状況',
  plan_cycle: 'プランサイクル: {{period}}。更新日: {{renewDate}}。',
  next_bill: '次の請求書',
  next_bill_hint: '計算方法については、次の<a>記事</a>を参照してください。',
  next_bill_tip:
    '次の請求書には、次の月のプランのベース価格と、各ティアのMAU単価での使用料金が含まれます。',
  manage_payment: '支払い方法の管理',
  overfill_quota_warning:
    'クォータ制限に到達しました。問題を防ぐために、プランをアップグレードしてください。',
  upgrade_pro: 'プロプランにアップグレード',
  update_payment: '支払いを更新する',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    '支払いに問題が発生しました。前回のサイクルで ${{price, number}} を処理できませんでした。Logtoのサービス停止を回避するために支払いを更新してください。',
  downgrade: 'ダウングレード',
  current: '現在',
  buy_now: '今すぐ購入',
  contact_us: 'お問い合わせ',
  quota_table,
  billing_history: {
    invoice_column: '請求書',
    status_column: 'ステータス',
    amount_column: '金額',
    invoice_created_date_column: '請求書作成日',
    invoice_status: {
      void: 'キャンセル済み',
      paid: '支払済み',
      open: '未処理',
      uncollectible: '延滞',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'ダウングレードしますか？',
    description:
      '<targetName/>に切り替える場合、以前の<currentName/>で使用できたクオータや機能は使用できなくなりますので注意してください。',
    before: '前: <name/>',
    after: '後: <name/>',
    downgrade: 'ダウングレード',
    not_eligible: 'ダウングレードできません',
    not_eligible_description:
      '<name/>にダウングレードする前に、以下の基準を満たしていることを確認してください。',
    a_maximum_of: '最大 <item/>',
    help_tip: 'ダウングレードのヘルプが必要ですか？ <a>お問い合わせ</a>。',
  },
  upgrade_success: '正常に<name/>にアップグレードされました',
  downgrade_success: '正常に<name/>にダウングレードされました',
  subscription_check_timeout:
    'サブスクリプションのチェックがタイムアウトしました。後でもう一度更新してください。',
};

export default subscription;
