import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'Planı Yükselt',
  compare_plans: 'Planları Karşılaştır',
  view_plans: 'Planları Görüntüle',
  create_tenant: {
    title: 'Kiracı planınızı seçin',
    description:
      'Logto, büyüyen şirketler için tasarlanmış yenilikçi ve uygun fiyatlı fiyatlandırma seçenekleri sunar. <a>Daha fazla bilgi edinin</a>',
    base_price: 'Temel Fiyat',
    monthly_price: '{{value, number}}/ay',
    mau_unit_price: 'MAU birim fiyatı',
    view_all_features: 'Tüm özellikleri görüntüle',
    select_plan: "<name/>'ı Seçin",
    free_tenants_limit: 'En fazla {{count, number}} ücretsiz kiracı',
    free_tenants_limit_other: 'En fazla {{count, number}} ücretsiz kiracı',
    most_popular: 'En Popüler',
    upgrade_success: "<name/>'a Başarıyla Yükseltildi",
  },
  mau_exceeded_modal: {
    title: 'MAU sınırı aşıldı. Planınızı yükseltin.',
    notification:
      'Mevcut MAU, <planName/> sınırını aştı. Logto hizmetinin askıya alınmasını önlemek için premium plana hemen yükseltin.',
    update_plan: 'Planı Güncelle',
  },
  payment_overdue_modal: {
    title: 'Fatura ödemesi gecikti',
    notification:
      'Oops! Kiracı <span>{{name}}</span> faturasının ödemesi başarısız oldu. Logto hizmetinin askıya alınmaması için faturayı zamanında ödeyin.',
    unpaid_bills: 'Ödenmemiş faturalar',
    update_payment: 'Ödemeyi Güncelle',
  },
  /** UNTRANSLATED */
  charge_notification_for_quota_limit:
    'You have reached your quota limit. We may add charges for features that go beyond your quota limit as add-ons, once we finalize the prices.',
  /** UNTRANSLATED */
  charge_notification_for_token_limit:
    'You have reached your {{value}}M token quota limit. We may add charges for features that go beyond your quota limit as add-ons, once we finalize the prices.',
  paywall,
};

export default Object.freeze(upsell);
