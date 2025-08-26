const usage = {
  status_active: 'Kullanımda',
  status_inactive: 'Kullanımda değil',
  limited_status_quota_description: '(İlk {{quota}} dahil)',
  unlimited_status_quota_description: '(Dahil)',
  disabled_status_quota_description: '(Dahil değil)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (Sınırsız)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (İlk {{basicQuota}} dahil)</span>',
  usage_description_without_quota: '{{usage}}<span> (Dahil değil)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Bir MAU, bir faturalandırma döngüsü içinde Logto ile en az bir token değiştirmiş benzersiz bir kullanıcıdır. Pro Plan için sınırsızdır. <a>Daha fazla bilgi edin</a>',
    tooltip_for_enterprise:
      'Bir MAU, Logto ile bir faturalandırma döngüsü içinde en az bir token değiştirmiş benzersiz bir kullanıcıdır. Kurumsal Plan için sınırsızdır.',
  },
  organizations: {
    title: 'Organizasyonlar',
    tooltip:
      'Aylık {{price, number}} $ sabit ücretle ek özellik. Fiyat, organizasyon sayısı veya aktiviteleriyle değişmez.',
    description_for_enterprise: '(Dahil)',
    tooltip_for_enterprise:
      "Dahil olma durumu planınıza bağlıdır. Organizasyon özelliği başlangıç sözleşmenizde yoksa, bu özelliği etkinleştirdiğinizde faturanıza eklenir. Eklenti, organizasyon sayısı veya aktiviteleri ne olursa olsun aylık ${{price, number}}'a mal olur.",
    tooltip_for_enterprise_with_numbered_basic_quota:
      "Planınız, ilk {{basicQuota}} organizasyonu ücretsiz olarak içerir. Daha fazlasına ihtiyacınız varsa, organizasyon eklentisi ile organizasyon sayısı veya aktivite seviyesinden bağımsız olarak aylık ${{price, number}}'a ekleyebilirsiniz.",
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Aylık {{price, number}} $ sabit ücretle ek özellik. Fiyat, kullanılan kimlik doğrulama faktörlerinin sayısından etkilenmez.',
    tooltip_for_enterprise:
      "Dahil olma durumu planınıza bağlıdır. MFA özelliği başlangıç sözleşmenizde yoksa, bu özelliği etkinleştirdiğinizde faturanıza eklenir. Eklenti, kullanılan kimlik doğrulama faktörlerinin sayısından bağımsız olarak aylık ${{price, number}} 'a mal olur.",
  },
  enterprise_sso: {
    title: 'Kurumsal SSO',
    tooltip: 'Her bir SSO bağlantısı için aylık {{price, number}} $ ücretle ek özellik.',
    tooltip_for_enterprise:
      'Ek bir özellik olarak, sözleşmeye dayalı planınızdaki ilk {{basicQuota}} SSO dahil edilmiştir. Daha fazla ihtiyacınız varsa, her SSO bağlantısı için aylık ${{price, number}} ücretle.',
  },
  api_resources: {
    title: 'API kaynakları',
    tooltip:
      'Her bir kaynak için aylık {{price, number}} $ ücretle ek özellik. İlk 3 API kaynağı ücretsizdir.',
    tooltip_for_enterprise:
      'Sözleşmeye dayalı planınız, ilk {{basicQuota}} API kaynağını içerir ve ücretsiz kullanım sağlar. Daha fazla ihtiyacınız varsa, her API kaynağı için aylık ${{price, number}}.',
  },
  machine_to_machine: {
    title: 'Makineden makineye',
    tooltip:
      'Uygulama başına aylık {{price, number}} $ ücretle ek özellik. İlk makineden makineye uygulama ücretsizdir.',
    tooltip_for_enterprise:
      'Sözleşmeye dayalı planınız, ilk {{basicQuota}} makineden makineye uygulamasını ücretsiz kullanım sağlar. Daha fazla ihtiyacınız varsa, her uygulama için aylık ${{price, number}}.',
  },
  tenant_members: {
    title: 'Kiracı üyeler',
    tooltip:
      'Üyelik başına ayda {{price, number}} $ fiyatlandırılan eklenti özelliği. İlk {{count}} kiracı üye ücretsizdir.',
    tooltip_one:
      'Ayda üye başına ${{price, number}} fiyatlandırılan eklenti özelliği. İlk {{count}} kiracı üye ücretsizdir.',
    tooltip_other:
      'Ayda üye başına ${{price, number}} fiyatlandırılan eklenti özelliği. İlk {{count}} kiracı üye ücretsizdir.',
    tooltip_for_enterprise:
      'Sözleşmeye dayalı planınız, ilk {{basicQuota}} kiracı üyeyi içerir ve ücretsiz kullanım sağlar. Daha fazla ihtiyacınız varsa, her kiracı üye için aylık ${{price, number}}.',
  },
  tokens: {
    title: 'Tokenler',
    tooltip:
      '{{tokenLimit}} token başına {{price, number}} $ ücretle ek özellik. İlk 1 {{basicQuota}} token dahildir.',
    tooltip_for_enterprise:
      'Sözleşmeye dayalı planınız, ilk {{basicQuota}} tokenleri içerir ve ücretsiz kullanım sağlar. Daha fazla ihtiyacınız varsa, her {{tokenLimit}} token için aylık ${{price, number}}.',
  },
  hooks: {
    title: 'Hooklar',
    tooltip: 'Her bir hook için {{price, number}} $ ücretle ek özellik. İlk 10 hook dahildir.',
    tooltip_for_enterprise:
      "Sözleşmeye dayalı planınız, ilk {{basicQuota}} hook'u içerir ve ücretsiz kullanım sağlar. Daha fazla ihtiyacınız varsa, her hook için aylık ${{price, number}}.",
  },
  security_features: {
    title: 'Gelişmiş güvenlik',
    tooltip:
      'CAPTCHA, kimlik kilitleme, e-posta engelleme listesi ve daha fazlasını içeren tam gelişmiş güvenlik paketi için ayda ${{price, number}} fiyatlandırılan eklenti özelliği.',
  },
  saml_applications: {
    title: 'SAML uygulaması',
    tooltip: 'Ayda uygulama başına ${{price, number}} ücretle ek özellik.',
  },
  third_party_applications: {
    title: 'Üçüncü parti uygulama',
    tooltip: 'Ayda uygulama başına ${{price, number}} ücretle ek özellik.',
  },
  rbacEnabled: {
    title: 'Roller',
    tooltip:
      'Ayda sabit {{price, number}} $ oranla ek özellik. Fiyat, global rollerin sayısından etkilenmez.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Mevcut faturalandırma döngüsü sırasında herhangi bir değişiklik yaparsanız, değişiklikten sonraki ilk ay için faturanız biraz daha yüksek olabilir. Bu, mevcut döngüden faturalanmamış kullanım için ek maliyet artı bir sonraki döngü için tam ücret ile birlikte {{price, number}} $ taban fiyat olacaktır. <a>Daha fazla bilgi edin</a>',
  },
};

export default Object.freeze(usage);
