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
  user_subscriptions: {
    description:
      'Seçili kiracıdan bağımsız olarak kişisel aboneliklerinizi ve sözleşmeye bağlı Enterprise kapsamınızı görüntüleyin.',
    personal_title: 'Kişisel abonelikler',
    personal_description: 'Geçmiş abonelikler dahil hesabınıza faturalandırılan abonelikler.',
    price: 'Fiyat',
    billing_period: 'Fatura dönemi',
    list_price_note:
      'Fiyatlara vergiler ve indirimler dahil değildir. Değişiklikler bir sonraki faturanızda kıst olarak hesaplanır.',
    overdue_note:
      'Ödemenin vadesi geçti. Ödenmemeye devam ederse abonelik duraklatılabilir ve ücretli özellikleri kaldırılabilir.',
    cancel_on: '{{date}} tarihinde iptal edilecek',
    other_product: 'Diğer abonelik',
    enterprise_invoices_description:
      'Enterprise sözleşmenizin faturaları. Görüntülemek ve fatura ya da makbuzu indirmek için bir fatura seçin.',
    personal_invoices_description:
      'Geçmiş abonelikler dahil, hesabınıza faturalanan aboneliklerin faturaları. Görüntülemek ve fatura ya da makbuzu indirmek için bir fatura seçin.',
    credit_note:
      'Kaldırma veya kıst hesaplamadan doğan krediler sonraki faturalardan düşülür ve ödeme yönteminize hemen iade edilmeyebilir.',
    invoice_link_unavailable:
      'Bu fatura sayfası kullanılamıyor. Bir kopyaya ihtiyacınız varsa bizimle iletişime geçin.',
    status: {
      active: 'Etkin',
      trialing: 'Deneme',
      past_due: 'Vadesi geçmiş',
      unpaid: 'Ödenmemiş',
      canceled: 'İptal edilmiş',
      incomplete: 'Tamamlanmamış',
      incomplete_expired: 'Süresi dolmuş',
      paused: 'Duraklatılmış',
    },
  },
};

export default Object.freeze(enterprise_subscription);
