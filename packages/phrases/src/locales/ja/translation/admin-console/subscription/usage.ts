const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'MAU は、請求サイクル内で Logto と少なくとも 1 つのトークンを交換したユニーク ユーザーです。Pro プランでは無制限です。<a>さらに詳しく</a>',
  },
  organizations: {
    title: '組織',
    description: '{{usage}}',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルの固定料金です。組織の数や活動レベルには影響されません。',
  },
  mfa: {
    title: '多要素認証',
    description: '{{usage}}',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルの固定料金です。使用する認証要素の数には影響されません。',
  },
  enterprise_sso: {
    title: 'エンタープライズ SSO',
    description: '{{usage}}',
    tooltip: '追加機能として、月額 {{price, number}} ドルの SSO 接続ごとの料金です。',
  },
  api_resources: {
    title: 'API リソース',
    description: '{{usage}} <span>(最初の 3 つは無料)</span>',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルのリソースごとの料金です。最初の 3 つの API リソースは無料です。',
  },
  machine_to_machine: {
    title: 'マシン対マシン',
    description: '{{usage}} <span>(最初の 1 つは無料)</span>',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルのアプリごとの料金です。最初のマシン対マシン アプリは無料です。',
  },
  tenant_members: {
    title: 'テナントメンバー',
    description: '{{usage}} <span>(最初の 3 つは無料)</span>',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルのメンバーごとの料金です。最初の 3 人のテナントメンバーは無料です。',
  },
  tokens: {
    title: 'トークン',
    description: '{{usage}}',
    tooltip:
      '追加機能として、100 万トークンにつき {{price, number}} ドルの料金です。最初の 100 万トークンは含まれています。',
  },
  hooks: {
    title: 'フック',
    description: '{{usage}} <span>(最初の 10 個は無料)</span>',
    tooltip:
      '追加機能として、フックごとに {{price, number}} ドルの料金です。最初の 10 個のフックは含まれています。',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '現在の請求サイクル中に変更を行った場合、次の請求書には変更後の最初の月に少し高くなる可能性があります。それは {{price, number}} ドルの基本価格に、未請求の使用の追加機能の費用と、次のサイクルの全額が加算されます。<a>さらに詳しく</a>',
  },
};

export default Object.freeze(usage);
