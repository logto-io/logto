import featured_plan_content from './featured-plan-content.js';
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
    view_all_features: 'Tüm özellikleri görüntüle',
    select_plan: "'<name/>'ı Seçin",
    free_tenants_limit: 'En fazla {{count, number}} ücretsiz kiracı',
    free_tenants_limit_other: 'En fazla {{count, number}} ücretsiz kiracı',
    most_popular: 'En Popüler',
    upgrade_success: "'<name/>'a Başarıyla Yükseltildi",
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
  add_on_quota_item: {
    api_resource: 'API kaynağı',
    machine_to_machine: 'makine-makine uygulaması',
    tokens: '{{limit}}M jeton',
    tenant_member: 'kiracı üyesi',
  },
  charge_notification_for_quota_limit:
    '{{item}} kota sınırını aştınız. Logto, kota sınırınızın ötesindeki kullanım için ücret ekleyecektir. Yeni ek paket fiyatlandırma tasarımı gününüzde başlayacaktır. <a>Daha fazla bilgi</a>',
  paywall,
  featured_plan_content,
};

export default Object.freeze(upsell);
