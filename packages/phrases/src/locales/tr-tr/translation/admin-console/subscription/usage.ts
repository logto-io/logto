const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'Bir MAU, bir faturalandırma döngüsü içinde Logto ile en az bir token değiştirmiş benzersiz bir kullanıcıdır. Pro Plan için sınırsızdır. <a>Daha fazla bilgi edin</a>',
  },
  organizations: {
    title: 'Organizasyonlar',
    description: '{{usage}}',
    tooltip:
      'Aylık {{price, number}} $ sabit ücretle ek özellik. Fiyat, organizasyon sayısı veya aktiviteleriyle değişmez.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'Aylık {{price, number}} $ sabit ücretle ek özellik. Fiyat, kullanılan kimlik doğrulama faktörlerinin sayısından etkilenmez.',
  },
  enterprise_sso: {
    title: 'Kurumsal SSO',
    description: '{{usage}}',
    tooltip: 'Her bir SSO bağlantısı için aylık {{price, number}} $ ücretle ek özellik.',
  },
  api_resources: {
    title: 'API kaynakları',
    description: '{{usage}} <span>(İlk 3 ücretsizdir)</span>',
    tooltip:
      'Her bir kaynak için aylık {{price, number}} $ ücretle ek özellik. İlk 3 API kaynağı ücretsizdir.',
  },
  machine_to_machine: {
    title: 'Makineden makineye',
    description: '{{usage}} <span>(İlk 1 ücretsizdir)</span>',
    tooltip:
      'Uygulama başına aylık {{price, number}} $ ücretle ek özellik. İlk makineden makineye uygulama ücretsizdir.',
  },
  tenant_members: {
    title: 'Kiracı üyeler',
    description: '{{usage}} <span>(İlk 3 ücretsizdir)</span>',
    tooltip:
      'Üye başına aylık {{price, number}} $ ücretle ek özellik. İlk 3 kiracı üye ücretsizdir.',
  },
  tokens: {
    title: 'Tokenler',
    description: '{{usage}}',
    tooltip:
      'Milyon token başına {{price, number}} $ ücretle ek özellik. İlk 1 milyon token dahildir.',
  },
  hooks: {
    title: 'Hooklar',
    description: '{{usage}} <span>(İlk 10 ücretsizdir)</span>',
    tooltip: 'Her bir hook için {{price, number}} $ ücretle ek özellik. İlk 10 hook dahildir.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Mevcut faturalandırma döngüsü sırasında herhangi bir değişiklik yaparsanız, değişiklikten sonraki ilk ay için faturanız biraz daha yüksek olabilir. Bu, mevcut döngüden faturalanmamış kullanım için ek maliyet artı bir sonraki döngü için tam ücret ile birlikte {{price, number}} $ taban fiyat olacaktır. <a>Daha fazla bilgi edin</a>',
  },
};

export default Object.freeze(usage);
