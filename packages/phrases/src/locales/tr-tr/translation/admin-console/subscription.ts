const subscription = {
  free_plan: 'Ücretsiz Plan',
  free_plan_description:
    'Yan projeler ve başlangıç Logto denemeleri için. Kredi kartı gerektirmez.',
  hobby_plan: 'Hobi Planı',
  hobby_plan_description: 'Bireysel geliştiriciler veya geliştirme ortamları için.',
  pro_plan: 'Pro Planı',
  pro_plan_description: 'Logto ile endişesiz iş yapın.',
  enterprise: 'Kurumsal',
  current_plan: 'Mevcut Plan',
  current_plan_description:
    'Bu sizin mevcut planınızdır. Plan kullanımınızı, sonraki faturanızı görebilir ve isterseniz daha yüksek bir seviye plana yükseltebilirsiniz.',
  plan_usage: 'Plan kullanımı',
  plan_cycle: 'Plan döngüsü: {{period}}. Kullanım {{renewDate}} tarihinde yenilenir.',
  next_bill: 'Bir sonraki faturanız',
  next_bill_hint: 'Hesaplama hakkında daha fazla bilgi için, lütfen bu <a>makaleye</a> başvurun.',
  next_bill_tip:
    'Yaklaşan faturanız, bir sonraki ay için planınızın taban fiyatını, ayrıca çeşitli seviyelerde MAU birim fiyatına göre kullanımınızın maliyetini içerir.',
  manage_payment: 'Ödemeyi yönet',
  overfill_quota_warning:
    'Kota sınırınıza ulaştınız. Herhangi bir sorunu önlemek için planı yükseltin.',
  upgrade_pro: "Pro'ya yükselt",
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Ödeme sorunu tespit edildi. Önceki döngü için ${{price, number}} işlenemiyor. Logto servisi askıya alınmasını önlemek için ödemeyi güncelleyin.',
  downgrade: 'Düşür',
  current: 'Mevcut',
  buy_now: 'Şimdi satın al',
  contact_us: 'Bizimle iletişime geçin',
  quota_table: {
    quota: {
      title: 'Kota',
      tenant_limit: 'Tenant limiti',
      base_price: 'Taban fiyat',
      mau_unit_price: '* MAU birim fiyatı',
      mau_limit: 'MAU limiti',
    },
    application: {
      title: 'Uygulamalar',
      total: 'Toplam',
      m2m: 'Makineye makine',
    },
    resource: {
      title: 'API kaynakları',
      resource_count: 'Kaynak sayısı',
      scopes_per_resource: 'Her kaynak için izin',
    },
    branding: {
      title: 'Markalaşma',
      custom_domain: 'Özel Alan Adı',
    },
    user_authn: {
      title: 'Kullanıcı kimlik doğrulama',
      omni_sign_in: 'Omni oturum açma',
      built_in_email_connector: 'Dahili e-posta bağlayıcısı',
      social_connectors: 'Sosyal bağlayıcılar',
      standard_connectors: 'Standart bağlayıcılar',
    },
    roles: {
      title: 'Roller',
      roles: 'Roller',
      scopes_per_role: 'Her rol için izin',
    },
    audit_logs: {
      title: 'Denetim kayıtları',
      retention: 'Saklama süresi',
    },
    hooks: {
      title: 'Hooks',
      amount: 'Miktar',
    },
    support: {
      title: 'Destek',
      community: 'Topluluk',
      customer_ticket: 'Müşteri destek talebi',
      premium: 'Premium',
    },
    mau_unit_price_footnote:
      '* Birim fiyatlarımız, asıl kaynakların tüketimine dayalı olarak değişebilir ve Logto, birim fiyatlardaki herhangi bir değişikliği açıklama hakkını saklı tutar.',
    unlimited: 'Sınırsız',
    contact: 'İletişim',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/ay',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '{{count, number}} gün',
    days_other: '{{count, number}} gün',
    add_on: 'Eklenti',
  },
  downgrade_form: {
    allowed_title: 'Gerçekten düşürmek istediğinize emin misiniz?',
    allowed_description:
      "{{plan}}'a düşürdüğünüzde, aşağıdaki avantajlara artık erişiminiz olmayacak.",
    not_allowed_title: 'Düşürme yapma hakkınız yok',
    not_allowed_description:
      "{{plan}}'a düşürmeden önce aşağıdaki standartları karşıladığınızdan emin olun. Gereklilikleri karşıladıktan ve yerine getirdikten sonra düşürme yapma hakkına sahip olacaksınız.",
    confirm_downgrade: 'Yine de düşür',
  },
};

export default subscription;
