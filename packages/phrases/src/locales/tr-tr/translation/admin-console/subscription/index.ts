import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Ücretsiz Plan',
  free_plan_description:
    'Yan projeler ve başlangıç Logto denemeleri için. Kredi kartı gerektirmez.',
  hobby_plan: 'Hobi Planı',
  hobby_plan_description: 'Bireysel geliştiriciler veya geliştirme ortamları için.',
  pro_plan: 'Pro Plan',
  pro_plan_description: "Endişesiz bir şekilde Logto'dan faydalanan işletmeler için.",
  enterprise: 'Kurumsal',
  current_plan: 'Mevcut Plan',
  current_plan_description:
    'Bu mevcut planınızdır. Plan kullanımını, bir sonraki faturanızı görüntüleyebilir ve dilerseniz daha yüksek bir seviye plana yükseltebilirsiniz.',
  plan_usage: 'Plan kullanımı',
  plan_cycle: 'Plan döngüsü: {{period}}. Kullanım {{renewDate}} tarihinde yenilenir.',
  next_bill: 'Bir sonraki faturanız',
  next_bill_hint: 'Hesaplama hakkında daha fazla bilgi için lütfen bu <a>makaleye</a> başvurun.',
  next_bill_tip:
    'Yaklaşan faturanız, bir sonraki ay için planınızın taban fiyatını ve çeşitli seviyelerde MAU birim fiyatıyla çarpılan kullanımınızın maliyetini içerir.',
  manage_payment: 'Ödemeleri düzenle',
  overfill_quota_warning:
    'Kota sınırınıza ulaştınız. Herhangi bir sorunu önlemek için planı yükseltin.',
  upgrade_pro: "Pro'ya yükselt",
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Ödeme hatası tespit edildi. Önceki döngü için ${{price, number}} işlenemedi. Logto hizmeti askıya alınmasını önlemek için ödemeleri güncelleyin.',
  downgrade: 'Düşür',
  current: 'Mevcut',
  buy_now: 'Şimdi satın al',
  contact_us: 'Bizimle iletişime geçin',
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
    not_eligible: 'Düşürme için uygun değilsiniz',
    not_eligible_description:
      "Aşağıdaki kriterleri karşıladığınızdan emin olun <name/>'ye düşürmeden önce.",
    a_maximum_of: 'En fazla <item/>',
    help_tip: 'Düşürme için yardıma mı ihtiyacınız var? <a>Bizimle iletişime geçin</a>.',
  },
  upgrade_success: 'Successfully upgraded to <name/>',
  downgrade_success: 'Successfully downgraded to <name/>',
  subscription_check_timeout:
    'Abonelik kontrolü zaman aşımına uğradı. Lütfen daha sonra yenileyin.',
};

export default subscription;
