import paywall from './paywall.js';

const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Planı Yükselt',
  compare_plans: 'Planları Karşılaştır',
  get_started: {
    title: 'Ücretsiz bir planla sorunsuz kimlik yolculuğunuza başlayın!',
    description:
      "Ücretsiz plan, Logto'yu yan projelerinizde veya denemelerinizde denemek için mükemmeldir. Ekibiniz için Logto'nun yeteneklerini tam anlamıyla kullanmak için sınırsız erişim elde etmek için yükseltme yaparak premium özelliklere sahip olun: sınırsız MAU kullanımı, Makine-Makine entegrasyonu, RBAC yönetimi, uzun süreli denetim günlükleri vb. <a>Tüm planları görüntüle</a>",
  },
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
  paywall,
};

export default Object.freeze(upsell);
