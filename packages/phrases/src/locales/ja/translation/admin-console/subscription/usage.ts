const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  /** UNTRANSLATED */
  limited_status_quota_description: '(First {{quota}} included)',
  /** UNTRANSLATED */
  unlimited_status_quota_description: '(Included)',
  /** UNTRANSLATED */
  disabled_status_quota_description: '(Not included)',
  /** UNTRANSLATED */
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unlimited)</span>',
  /** UNTRANSLATED */
  usage_description_with_limited_quota: '{{usage}}<span> (First {{basicQuota}} included)</span>',
  /** UNTRANSLATED */
  usage_description_without_quota: '{{usage}}<span> (Not included)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU は、請求サイクル内で Logto と少なくとも 1 つのトークンを交換したユニーク ユーザーです。Pro プランでは無制限です。<a>さらに詳しく</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: '組織',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルの固定料金です。組織の数や活動レベルには影響されません。',
    /** UNTRANSLATED */
    description_for_enterprise: '(Included)',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
    /** UNTRANSLATED */
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Your plan includes the first {{basicQuota}} organizations for free. If you need more, you can add them with the organization add-on at a flat rate of ${{price, number}} per month, regardless of the number of organizations or their activity level.',
  },
  mfa: {
    title: '多要素認証',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルの固定料金です。使用する認証要素の数には影響されません。',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'エンタープライズ SSO',
    tooltip: '追加機能として、月額 {{price, number}} ドルの SSO 接続ごとの料金です。',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'API リソース',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルのリソースごとの料金です。最初の 3 つの API リソースは無料です。',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'マシン対マシン',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルのアプリごとの料金です。最初のマシン対マシン アプリは無料です。',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'テナントメンバー',
    tooltip:
      '追加機能として、月額 {{price, number}} ドルのメンバーごとの料金です。最初の 3 人のテナントメンバーは無料です。',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'トークン',
    tooltip:
      '追加機能として、{{tokenLimit}} トークンにつき {{price, number}} ドルの料金です。最初の {{basicQuota}} トークンは含まれています。',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'フック',
    tooltip:
      '追加機能として、フックごとに {{price, number}} ドルの料金です。最初の 10 個のフックは含まれています。',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      '現在の請求サイクル中に変更を行った場合、次の請求書には変更後の最初の月に少し高くなる可能性があります。それは {{price, number}} ドルの基本価格に、未請求の使用の追加機能の費用と、次のサイクルの全額が加算されます。<a>さらに詳しく</a>',
  },
};

export default Object.freeze(usage);
