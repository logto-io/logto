import add_on from './add-on.js';
import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'ترقية الخطة',
  compare_plans: 'مقارنة الخطط',
  view_plans: 'عرض الخطط',
  create_tenant: {
    title: 'اختر خطة المستأجر الخاصة بك',
    description:
      'توفر Logto خيارات خطة تنافسية بأسعار مبتكرة ومعقولة مصممة للشركات الناشئة. <a>تعرف أكثر</a>',
    base_price: 'السعر الأساسي',
    monthly_price: '{{value, number}}/شهر',
    view_all_features: 'عرض جميع الميزات',
    select_plan: 'اختر <name/>',
    free_tenants_limit: 'حتى {{count, number}} مستأجر مجاني',
    free_tenants_limit_other: 'حتى {{count, number}} مستأجر مجاني',
    most_popular: 'الأكثر شعبية',
    upgrade_success: 'تم الترقية بنجاح إلى <name/>',
  },
  mau_exceeded_modal: {
    title: 'تجاوزت الحد الأقصى لـ MAU. قم بترقية خطتك.',
    notification:
      'لقد تجاوزت MAU الحالي الحد الأقصى لـ <planName/>. يرجى ترقية خطتك إلى النسخة المميزة بسرعة لتجنب تعليق خدمة Logto.',
    update_plan: 'تحديث الخطة',
  },
  token_exceeded_modal: {
    title: 'استخدام الرموز تجاوز الحد المسموح. قم بترقية خطتك.',
    notification:
      'لقد تجاوزت الحد المسموح لاستخدام الرموز لـ <planName/>. لن يتمكن المستخدمون من الوصول إلى خدمة Logto بشكل صحيح. يرجى ترقية خطتك إلى النسخة المميزة بسرعة لتجنب أي إزعاج.',
  },
  payment_overdue_modal: {
    title: 'تأخر في دفع الفاتورة',
    notification:
      'عفوًا! فشلت عملية الدفع لفاتورة المستأجر <span>{{name}}</span>. يرجى دفع الفاتورة بسرعة لتجنب تعليق خدمة Logto.',
    unpaid_bills: 'الفواتير الغير المدفوعة',
    update_payment: 'تحديث الدفع',
  },
  add_on_quota_item: {
    api_resource: 'مورد API',
    machine_to_machine: 'تطبيق من الجهاز إلى الجهاز',
    tokens: '{{limit}}M رموز',
    tenant_member: 'عضو المستأجر',
  },
  charge_notification_for_quota_limit:
    'لقد تجاوزت الحد الأقصى لحصة {{item}} الخاصة بك. ستقوم Logto بإضافة رسوم على الاستخدام الزائد لحصتك. ستبدأ عملية الفوترة في اليوم الذي يتم فيه إصدار تصميم التسعير الجديد للإضافة. <a>تعرف أكثر</a>',
  paywall,
  featured_plan_content,
  add_on,
  convert_to_production_modal: {
    title: 'أنت على وشك تغيير المستأجر التطويري إلى مستأجر إنتاجي',
    description:
      'جاهز للبث المباشر؟ تحويل هذا المستأجر التطويري إلى مستأجر إنتاجي يفتح لك جميع الوظائف',
    benefits: {
      stable_environment: 'للمستخدمين النهائيين: بيئة مستقرة للاستخدام الفعلي.',
      keep_pro_features:
        'الحفاظ على ميزات Pro: أنت على وشك الاشتراك في خطة Pro. <a>عرض ميزات Pro.</a>',
      no_dev_restrictions:
        'لا توجد قيود تطوير: إزالة حدود النظام الخاصة بالكيانات والموارد وشعار تسجيل الدخول.',
    },
    cards: {
      dev_description: 'لأغراض الاختبار',
      prod_description: 'إنتاج حقيقي',
      convert_label: 'تحويل',
    },
    button: 'تحويل إلى مستأجر إنتاجي',
  },
};

export default Object.freeze(upsell);
