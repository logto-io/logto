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
  user_subscriptions: {
    description:
      'اعرض اشتراكاتك الشخصية وتغطية Enterprise التعاقدية بصرف النظر عن المستأجر المحدد.',
    personal_title: 'الاشتراكات الشخصية',
    personal_description: 'الاشتراكات المفوترة لحسابك، بما فيها الاشتراكات السابقة.',
    enterprise_description:
      'تُحدَّد حصة Console SSO وفق عقدك ويتشاركها المسؤولون المخوّلون. تُفوتر الاشتراكات الشخصية بشكل منفصل.',
    allowance: 'الحصة التعاقدية',
    not_covered:
      'لا تتضمن خطة Enterprise هذه حصة Console SSO. تُفوتر الموصلات الجديدة ضمن اشتراك شخصي.',
    quantity_price: 'الكمية × سعر الوحدة',
    billing_period: 'فترة الفوترة',
    connectors: 'موصلات Console SSO',
    no_connectors: 'لا توجد موصلات',
    list_price_note:
      'تأتي الكمية وسعر الوحدة والحالة المعروضة من سجل الاشتراك. قد يترك تعليق التحصيل الكمية والحالة دون تغيير. لا تشمل أسعار الوحدات الضرائب أو الخصومات أو التسويات النسبية، ولا تمثل الرسوم الحالية أو مبلغًا مستحقًا.',
    proration_note:
      'تُحتسب إضافات Console SSO وإزالاته نسبيًا في الفاتورة المعتادة. يؤدي حذف آخر موصل مدفوع إلى إلغاء الاشتراك وتسويته.',
    overdue_note:
      'بعد ثلاث دورات فوترة متتالية غير مدفوعة واستنفاد المحاولات، يُعلّق التحصيل وتُزال موصلات Console SSO المدفوعة. لا تؤدي تحديثات الدفع إلى استعادة إعداداتها. تواصل معنا للحصول على المساعدة.',
    cancel_on: 'الإلغاء مقرر في {{date}}',
    other_product: 'اشتراك آخر',
    billing_history_title: 'سجل الفواتير',
    billing_history_description:
      'فواتير اشتراكاتك الشخصية وعقد Enterprise الخاص بك. اختر فاتورة لعرضها وتنزيل الفاتورة أو الإيصال.',
    credit_note:
      'تُخصم الأرصدة الناتجة عن الإزالة أو التناسب من الفواتير اللاحقة، ولا تُسترد بالضرورة إلى وسيلة الدفع على الفور.',
    invoice_link_unavailable: 'صفحة هذه الفاتورة غير متاحة. اتصل بنا إذا كنت بحاجة إلى نسخة.',
    status: {
      active: 'نشط',
      trialing: 'تجريبي',
      past_due: 'متأخر',
      unpaid: 'غير مدفوع',
      canceled: 'ملغى',
      incomplete: 'غير مكتمل',
      incomplete_expired: 'منتهي الصلاحية',
      paused: 'معلّق',
    },
  },
};

export default Object.freeze(enterprise_subscription);
