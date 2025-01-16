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
      'Bir MAU, bir faturalandırma döngüsü içinde Logto ile en az bir token değiştirmiş benzersiz bir kullanıcıdır. Pro Plan için sınırsızdır. <a>Daha fazla bilgi edin</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'Organizasyonlar',
    tooltip:
      'Aylık {{price, number}} $ sabit ücretle ek özellik. Fiyat, organizasyon sayısı veya aktiviteleriyle değişmez.',
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
    title: 'MFA',
    tooltip:
      'Aylık {{price, number}} $ sabit ücretle ek özellik. Fiyat, kullanılan kimlik doğrulama faktörlerinin sayısından etkilenmez.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'Kurumsal SSO',
    tooltip: 'Her bir SSO bağlantısı için aylık {{price, number}} $ ücretle ek özellik.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'API kaynakları',
    tooltip:
      'Her bir kaynak için aylık {{price, number}} $ ücretle ek özellik. İlk 3 API kaynağı ücretsizdir.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'Makineden makineye',
    tooltip:
      'Uygulama başına aylık {{price, number}} $ ücretle ek özellik. İlk makineden makineye uygulama ücretsizdir.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'Kiracı üyeler',
    tooltip:
      'Üye başına aylık {{price, number}} $ ücretle ek özellik. İlk 3 kiracı üye ücretsizdir.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'Tokenler',
    tooltip:
      '{{tokenLimit}} token başına {{price, number}} $ ücretle ek özellik. İlk 1 {{basicQuota}} token dahildir.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'Hooklar',
    tooltip: 'Her bir hook için {{price, number}} $ ücretle ek özellik. İlk 10 hook dahildir.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Mevcut faturalandırma döngüsü sırasında herhangi bir değişiklik yaparsanız, değişiklikten sonraki ilk ay için faturanız biraz daha yüksek olabilir. Bu, mevcut döngüden faturalanmamış kullanım için ek maliyet artı bir sonraki döngü için tam ücret ile birlikte {{price, number}} $ taban fiyat olacaktır. <a>Daha fazla bilgi edin</a>',
  },
};

export default Object.freeze(usage);
