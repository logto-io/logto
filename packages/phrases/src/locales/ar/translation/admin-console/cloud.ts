const cloud = {
  console_sso: {
    back_to_list: 'العودة إلى تسجيل الدخول الموحد لوحدة التحكم',
    create: 'إضافة موصل',
    title: 'تسجيل الدخول الموحّد لوحدة التحكم',
    description:
      'قم بتكوين موفّر الهوية الخاص بك لتسجيل الدخول إلى Logto Console باستخدام تسجيل الدخول الموحّد.',
    domain_bound: 'مرتبط',
    domain_pending: 'جارٍ التحقق',
    domain_add_placeholder: 'إضافة نطاق بريد إلكتروني',
    domain_membership_notice:
      'تتحكم النطاقات المتحقق منها في اكتشاف تسجيل الدخول الموحد إلى Logto Cloud Console. وهي لا تمنح عضوية المستأجر.',
    domain_bound_description:
      'هذا النطاق نشط لتسجيل الدخول الموحد إلى Console. تمت إزالة سجل TXT الخاص بالتحقق.',
    domain_dns_instructions: 'أضف سجل TXT هذا لدى مزود DNS للتحقق من ملكية النطاق.',
    domain_waiting_for_dns: 'بانتظار سجل TXT. نتحقق مرة أخرى كل 10 ثوانٍ.',
    domain_proven_unbound:
      'تم التحقق من ملكية النطاق، لكن الربط لم يكتمل. عالج المشكلة ثم أعد المحاولة.',
    domain_remove_description:
      'هل تريد إزالة {{domain}} من Console SSO؟ ستؤدي إزالة نطاق مرتبط إلى إيقاف اكتشاف SSO لعناوين البريد الإلكتروني الخاصة به.',
    domain_invalid: 'أدخل نطاق بريد إلكتروني صالحًا.',
    domain_conflict: 'هذا النطاق مرتبط بالفعل بموصل Console SSO آخر.',
    domain_invalid_provider: 'أكمل إعدادات الاتصال قبل ربط هذا النطاق.',
    domain_dns_timeout: 'فشل التحقق من DNS. سنعيد المحاولة تلقائيًا.',
    domain_recovery: 'لم يكتمل تغيير النطاق. أعد محاولة التحقق لإتمامه.',
    start_over: 'البدء من جديد',
    start_over_confirmation: 'قد تؤدي إعادة البدء إلى حذف إعداد SSO غير المكتمل. هل تريد المتابعة؟',
    resume_creation:
      'تم العثور على عملية إنشاء غير مكتملة. تابع باستخدام الموفر نفسه لاستعادة هذا الموصل.',
  },
  general: {
    onboarding: 'عملية التسجيل',
  },
  create_tenant: {
    page_title: 'إنشاء مستأجر',
    title: 'أنشئ أول مستأجر لك',
    description:
      'المستأجر هو بيئة معزولة حيث يمكنك إدارة هويات المستخدمين والتطبيقات وجميع الموارد الأخرى في Logto.',
    invite_collaborators: 'ادعو مشاركيك عبر البريد الإلكتروني',
    hear_about_us: {
      title: 'كيف سمعت عن Logto لأول مرة؟',
      detail_placeholder: 'أخبرنا المزيد (اختياري)',
      options: {
        search_engine: 'محرك بحث (Google، Bing...)',
        ai_assistant: 'مساعد ذكاء اصطناعي (ChatGPT، Claude، Gemini...)',
        github_oss: 'GitHub أو أدلة المصادر المفتوحة',
        friend_colleague: 'صديق أو زميل',
        powered_by: 'صفحة تسجيل الدخول لتطبيق يستخدم Logto',
        content_social: 'وسائل التواصل الاجتماعي أو مقال أو فيديو (YouTube، X، Reddit...)',
        other: 'أخرى',
      },
    },
  },
  social_callback: {
    title: 'لقد قمت بتسجيل الدخول بنجاح',
    description:
      'لقد قمت بتسجيل الدخول بنجاح باستخدام حسابك الاجتماعي. لضمان التكامل السلس والوصول إلى جميع ميزات Logto، نوصي بمتابعة تكوين موصلك الاجتماعي الخاص بك.',
    notice:
      'يرجى تجنب استخدام الموصل التجريبي لأغراض الإنتاج. بمجرد الانتهاء من الاختبار، نرجو حذف الموصل التجريبي وإعداد موصلك الخاص باستخدام بيانات الاعتماد الخاصة بك.',
  },
  tenant: {
    create_tenant: 'إنشاء مستأجر',
  },
};

export default Object.freeze(cloud);
