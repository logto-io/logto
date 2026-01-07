const enterprise_subscription = {
  page_title: 'Abonelik',
  title: 'Aboneliğinizi yönetin',
  subtitle: 'Bu, çok kiracılı aboneliğinizi ve fatura geçmişinizi yönetmek içindir',
  tab: {
    subscription: 'Abonelik',
    billing_history: 'Fatura geçmişi',
  },
  subscription: {
    title: 'Abonelik',
    description:
      'Kullanımınızı kolayca takip edin, bir sonraki faturanızı görün ve orijinal sözleşmenizi gözden geçirin.',
    enterprise_plan_title: 'Enterprise Planı',
    enterprise_plan_description:
      'Bu, Enterprise planı aboneliğinizdir ve bu kota kiracılar arasında paylaşılır. Kullanım güncellemelerinde küçük bir gecikme olabilir.',
    add_on_title: 'Kullandıkça öde eklentiler',
    add_on_description:
      "Bunlar, sözleşmenize veya Logto'nun standart kullandıkça öde tarifesine dayanan ek eklentilerdir. Gerçek kullanımınıza göre ücretlendirilirsiniz.",
    included: 'Dahil',
    over_quota: 'Kota Aşıldı',
    basic_plan_column_title: {
      product: 'Ürün',
      usage: 'Kullanım',
      quota: 'Kota',
    },
    add_on_column_title: {
      product: 'Ürün',
      unit_price: 'Birim Fiyatı',
      quantity: 'Miktar',
      total_price: 'Toplam',
    },
    add_on_sku_price: '{{price}}/ay',
    private_region_title: 'Özel bulut örneği ({{regionName}})',
    shared_cross_tenants: 'Kiracılar arası',
  },
};

export default Object.freeze(enterprise_subscription);
