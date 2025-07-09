import add_on from './add-on.js';
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
  token_exceeded_modal: {
    title: 'Jeton kullanımı sınırı aştı. Planınızı yükseltin.',
    notification:
      'Belirtilen jeton kullanım sınırınızı <planName/> aştınız. Kullanıcılar Logto hizmetine düzgün bir şekilde erişemeyecektir. Herhangi bir aksaklık yaşamamak için lütfen planınızı premium seviyeye hızlıca yükseltin.',
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
  add_on,
  convert_to_production_modal: {
    title: 'Geliştirme kiracınızı üretim kiracısına dönüştürüyorsunuz',
    description:
      'Yayın yapmaya hazır mısınız? Bu geliştirme kiracısını üretim kiracısına dönüştürmek, tüm işlevselliğin kilidini açar',
    benefits: {
      stable_environment: 'Son kullanıcılar için: Gerçek kullanım için kararlı bir ortam.',
      keep_pro_features:
        'Pro özelliklerini koruyun: Pro planına abone olacaksınız. <a>Pro özelliklerini görüntüleyin.</a>',
      no_dev_restrictions:
        'Geliştirme kısıtlamaları yok: Varlık ve kaynak sistem sınırlarını ve oturum açma bannerını kaldırır.',
    },
    cards: {
      dev_description: 'Test amaçlı',
      prod_description: 'Gerçek üretim',
      convert_label: 'dönüştür',
    },
    button: 'Üretim kiracısına dönüştür',
  },
};

export default Object.freeze(upsell);
