const enterprise_subscription = {
  page_title: 'Abonelik',
  title: 'Aboneliğinizi yönetin',
  subtitle:
    'Çok kiracılı abonelik detaylarınızı ve faturalandırma bilgilerinizi görüntüleyin ve yönetin.',
  tab: {
    subscription: 'Abonelik',
    billing_history: 'Fatura geçmişi',
  },
  subscription: {
    title: 'Abonelik',
    description:
      'Mevcut abonelik planı kullanım detaylarınızı ve faturalandırma bilgilerinizi inceleyin.',
    enterprise_plan_title: 'Enterprise Planı',
    enterprise_plan_description:
      'Bu, Enterprise plan aboneliğinizdir ve bu kota, kurumsal aboneliğiniz altındaki tüm kiracılar arasında paylaşılır.',
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
