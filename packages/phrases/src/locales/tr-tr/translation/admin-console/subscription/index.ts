import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Ücretsiz Plan',
  free_plan_description:
    'Yan projeler ve başlangıç Logto denemeleri için. Kredi kartı gerektirmez.',
  pro_plan: 'Pro plan',
  pro_plan_description: "Endişesiz bir şekilde Logto'dan faydalanan işletmeler için.",
  enterprise: 'Kurumsal',
  /** UNTRANSLATED */
  enterprise_description:
    'For large-scale organizations requiring advanced features, full customization, and dedicated support to power mission-critical applications. Tailored to your needs for ultimate security, compliance, and performance.',
  /** UNTRANSLATED */
  admin_plan: 'Admin plan',
  /** UNTRANSLATED */
  dev_plan: 'Development plan',
  current_plan: 'Mevcut Plan',
  current_plan_description:
    'İşte mevcut planınız. Plan kullanımınızı kolayca görebilir, önümüzdeki faturanızı kontrol edebilir ve ihtiyaç duydukça planınızda değişiklikler yapabilirsiniz.',
  plan_usage: 'Plan kullanımı',
  plan_cycle: 'Plan döngüsü: {{period}}. Kullanım {{renewDate}} tarihinde yenilenir.',
  /** UNTRANSLATED */
  next_bill: 'Your upcoming bill',
  next_bill_hint: 'Hesaplama hakkında daha fazla bilgi için lütfen bu <a>makaleye</a> başvurun.',
  /** UNTRANSLATED */
  next_bill_tip:
    'The prices displayed here are tax-exclusive and may be subject to a slight delay in updates. The tax amount will be calculated based on the information you provide and your local regulatory requirements, and will be shown in your invoices.',
  manage_payment: 'Ödemeleri düzenle',
  overfill_quota_warning:
    'Kota sınırınıza ulaştınız. Herhangi bir sorunu önlemek için planı yükseltin.',
  upgrade_pro: "Pro'ya yükselt",
  update_payment: 'Ödemeyi Güncelle',
  payment_error:
    'Ödeme hatası tespit edildi. Önceki döngü için ${{price, number}} işlenemedi. Logto hizmeti askıya alınmasını önlemek için ödemeleri güncelleyin.',
  downgrade: 'Düşür',
  current: 'Mevcut',
  upgrade: 'Yükselt',
  quota_table,
  billing_history: {
    invoice_column: 'Faturalar',
    status_column: 'Durum',
    amount_column: 'Miktar',
    invoice_created_date_column: 'Fatura oluşturma tarihi',
    invoice_status: {
      void: 'İptal Edildi',
      paid: 'Ödendi',
      open: 'Açık',
      uncollectible: 'Gecikmiş',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'Emin misiniz, düşürmek istediğinize?',
    description:
      "Eğer <targetName/>'e geçmeyi seçerseniz, önceki <currentName/> içindeki kotalara ve özelliklere artık erişiminiz olmayacağını unutmayın.",
    before: 'Önce: <name/>',
    after: 'Sonra: <name />',
    downgrade: 'Düşür',
  },
  not_eligible_modal: {
    downgrade_title: 'Düşürme için uygun değilsiniz',
    downgrade_description:
      '<name/> planına düşürmeden önce aşağıdaki kriterleri sağladığınızdan emin olun.',
    downgrade_help_tip:
      'Düşürme konusunda yardıma mı ihtiyacınız var? <a>Bizimle iletişime geçin</a>.',
    upgrade_title: 'Saygıdeğer erken benimseyenlerimiz için dostane hatırlatma',
    upgrade_description:
      "Şu anda <name /> tarafından izin verilenden daha fazlasını kullanıyorsunuz. Logto artık resmi olarak kullanılabilir durumda ve her plana özel özellikler sunuyor. <name />'e yükseltmeyi düşünmeden önce, yükseltme öncesinde aşağıdaki kriterleri karşıladığınızdan emin olun.",
    upgrade_pro_tip: " Ya da Pro plan'a geçmeyi düşünün.",
    upgrade_help_tip:
      'Yükseltme konusunda yardıma mı ihtiyacınız var? <a>Bizimle iletişime geçin</a>.',
    a_maximum_of: '<item/> için maksimum',
  },
  upgrade_success: 'Successfully upgraded to <name/>',
  downgrade_success: 'Successfully downgraded to <name/>',
  subscription_check_timeout:
    'Abonelik kontrolü zaman aşımına uğradı. Lütfen daha sonra yenileyin.',
  no_subscription: 'Abonelik bulunamadı',
};

export default Object.freeze(subscription);
