const enterprise_subscription = {
  page_title: 'الاشتراك',
  title: 'إدارة اشتراكك',
  subtitle: 'هذا لإدارة اشتراكك المتعدد المستأجرين وسجل الفواتير الخاص بك',
  tab: {
    subscription: 'الاشتراك',
    billing_history: 'تاريخ الفوترة',
  },
  subscription: {
    title: 'الاشتراك',
    description: 'قم بتتبع استخدامك بسهولة، واطلع على فاتورتك التالية، وراجع عقدك الأصلي.',
    enterprise_plan_title: 'خطة الشركات',
    enterprise_plan_description:
      'هذا هو اشتراك خطتك للشركات وهذه الحصة مشتركة بين المستأجرين. قد يكون هناك تأخير طفيف في تحديث الاستخدام.',
    add_on_title: 'إضافات الدفع حسب الاستخدام',
    add_on_description:
      'هذه هي الإضافات التي تم دفعها كاشتراك حسب الاستخدام بناءً على عقدك أو على أسعار الدفع القياسية الخاصة ب Logto. سيتم احتساب الرسوم حسب استخدامك الفعلي.',
    included: 'مضمن',
    over_quota: 'تجاوز الحصة',
    basic_plan_column_title: {
      product: 'المنتج',
      usage: 'الاستخدام',
      quota: 'الحصة',
    },
    add_on_column_title: {
      product: 'المنتج',
      unit_price: 'السعر لكل وحدة',
      quantity: 'الكمية',
      total_price: 'الإجمالي',
    },
    add_on_sku_price: '${{price}}/شهر',
    private_region_title: 'مثيل سحابي خاص ({{regionName}})',
    shared_cross_tenants: 'عبر المستأجرين',
  },
};

export default Object.freeze(enterprise_subscription);
