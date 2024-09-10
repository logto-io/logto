import quota_item from './quota-item.js';
import quota_table from './quota-table.js';
import usage from './usage.js';

const subscription = {
  free_plan: 'خطة مجانية',
  free_plan_description: 'للمشاريع الجانبية وتجارب Logto الأولية. بدون بطاقة ائتمان.',
  pro_plan: 'خطة Pro',
  pro_plan_description: 'للاستفادة من الأعمال بدون قلق مع Logto.',
  enterprise: 'الشركات',
  /** UNTRANSLATED */
  enterprise_description:
    'For large-scale organizations requiring advanced features, full customization, and dedicated support to power mission-critical applications. Tailored to your needs for ultimate security, compliance, and performance.',
  current_plan: 'الخطة الحالية',
  current_plan_description:
    'هذه هي الخطة الحالية الخاصة بك. يمكنك بسهولة رؤية استخدام الخطة الخاصة بك ، والتحقق من فاتورتك القادمة ، وإجراء التغييرات على الخطة حسب الحاجة.',
  plan_usage: 'استخدام الخطة',
  plan_cycle: 'دورة الخطة: {{period}}. يتم تجديد الاستخدام في {{renewDate}}.',
  next_bill: 'الفاتورة القادمة',
  next_bill_hint: 'لمعرفة المزيد حول الحساب ، يرجى الرجوع إلى هذه المقالة <a>article</a>.',
  next_bill_tip:
    'الأسعار المعروضة هنا لا تشمل الضرائب. سيتم حساب مبلغ الضريبة بناءً على المعلومات التي تقدمها ومتطلبات التنظيم المحلية ، وسيتم عرضه في فواتيرك.',
  manage_payment: 'إدارة الدفع',
  overfill_quota_warning: 'لقد وصلت إلى حد الحصة الخاصة بك. لمنع أي مشكلة ، قم بترقية الخطة.',
  upgrade_pro: 'ترقية Pro',
  update_payment: 'تحديث الدفع',
  payment_error:
    'تم اكتشاف مشكلة في الدفع. تعذر معالجة ${{price, number}} للدورة السابقة. قم بتحديث الدفع لتجنب تعليق خدمة Logto.',
  downgrade: 'تخفيض',
  current: 'الحالي',
  upgrade: 'ترقية',
  quota_table,
  billing_history: {
    invoice_column: 'الفواتير',
    status_column: 'الحالة',
    amount_column: 'المبلغ',
    invoice_created_date_column: 'تاريخ إنشاء الفاتورة',
    invoice_status: {
      void: 'ملغاة',
      paid: 'مدفوعة',
      open: 'مفتوحة',
      uncollectible: 'متأخرة',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'هل أنت متأكد أنك تريد التخفيض؟',
    description:
      'إذا قررت التبديل إلى <targetName/>, يرجى ملاحظة أنه لن يكون لديك بعد الآن الوصول إلى الحصة والميزات التي كانت موجودة في <currentName/>.',
    before: 'قبل: <name/>',
    after: 'بعد: <name />',
    downgrade: 'تخفيض',
  },
  not_eligible_modal: {
    downgrade_title: 'غير مؤهل للتخفيض',
    downgrade_description: 'تأكد من تلبية المعايير التالية قبل التخفيض إلى <name/>.',
    downgrade_help_tip: 'هل تحتاج إلى مساعدة في التخفيض؟ <a>اتصل بنا</a>.',
    upgrade_title: 'تذكير ودي لمبتكرينا المبكرين المحترمين',
    upgrade_description:
      'أنت تستخدم حاليًا أكثر مما يسمح به <name />. Logto الآن رسميًا ، بما في ذلك ميزات مصممة خصيصًا لكل خطة. قبل أن تفكر في الترقية إلى <name />, تأكد من تلبية المعايير التالية قبل الترقية.',
    upgrade_pro_tip: ' أو النظر في الترقية إلى خطة Pro.',
    upgrade_help_tip: 'هل تحتاج إلى مساعدة في الترقية؟ <a>اتصل بنا</a>.',
    a_maximum_of: 'الحد الأقصى لـ <item/>',
  },
  upgrade_success: 'تم الترقية بنجاح إلى <name/>',
  downgrade_success: 'تم التخفيض بنجاح إلى <name/>',
  subscription_check_timeout: 'انتهت مهلة فحص الاشتراك. يرجى التحديث في وقت لاحق.',
  no_subscription: 'لا يوجد اشتراك',
  usage,
};

export default Object.freeze(subscription);
