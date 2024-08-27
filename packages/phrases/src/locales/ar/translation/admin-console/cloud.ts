const cloud = {
  general: {
    onboarding: 'عملية التسجيل',
  },
  welcome: {
    page_title: 'مرحبًا',
    title: 'مرحبًا بك في سحابة Logto! نحب أن نتعرف عليك قليلاً.',
    description: 'لنجعل تجربة Logto فريدة لك من خلال معرفة المزيد عنك. معلوماتك آمنة معنا.',
    project_field: 'أستخدم Logto لـ',
    project_options: {
      personal: 'مشروع شخصي',
      company: 'مشروع الشركة',
    },
    company_name_field: 'اسم الشركة',
    company_name_placeholder: 'Acme.co',
    stage_field: 'ما هو مرحلة منتجك حاليًا؟',
    stage_options: {
      new_product: 'بدء مشروع جديد والبحث عن حل سريع وجاهز',
      existing_product:
        'الانتقال من المصادقة الحالية (مثل البناء الذاتي، Auth0، Cognito، Microsoft)',
      target_enterprise_ready:
        'لقد حصلت للتو على عملاء أكبر والآن أرغب في جعل منتجي جاهزًا للبيع للشركات',
    },
    additional_features_field: 'هل لديك أي شيء آخر تود أن نعرفه؟',
    additional_features_options: {
      customize_ui_and_flow:
        'بناء وإدارة واجهة المستخدم الخاصة بي، وليس فقط استخدام حل Logto الجاهز وقابل للتخصيص',
      compliance: 'SOC2 و GDPR ضروريان',
      export_user_data: 'تحتاج إلى القدرة على تصدير بيانات المستخدم من Logto',
      budget_control: 'لدي مراقبة ميزانية صارمة جدًا',
      bring_own_auth: 'لدي خدمات المصادقة الخاصة بي وأحتاج فقط إلى بعض ميزات Logto',
      others: 'لا شيء من هذه الخيارات',
    },
  },
  create_tenant: {
    page_title: 'إنشاء مستأجر',
    title: 'أنشئ أول مستأجر لك',
    description:
      'المستأجر هو بيئة معزولة حيث يمكنك إدارة هويات المستخدمين والتطبيقات وجميع الموارد الأخرى في Logto.',
    invite_collaborators: 'ادعو مشاركيك عبر البريد الإلكتروني',
  },
  sie: {
    page_title: 'تخصيص تجربة تسجيل الدخول',
    title: 'لنقم بتخصيص تجربة تسجيل الدخول الخاصة بك بسهولة أولاً',
    inspire: {
      title: 'إنشاء أمثلة جذابة',
      description: 'هل تشعر بالتردد حول تجربة تسجيل الدخول؟ فقط انقر على "ألهمني" ودع السحر يحدث!',
      inspire_me: 'ألهمني',
    },
    logo_field: 'شعار التطبيق',
    color_field: 'لون العلامة التجارية',
    identifier_field: 'المعرف',
    identifier_options: {
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      user_name: 'اسم المستخدم',
    },
    authn_field: 'المصادقة',
    authn_options: {
      password: 'كلمة المرور',
      verification_code: 'رمز التحقق',
    },
    social_field: 'تسجيل الدخول الاجتماعي',
    finish_and_done: 'انتهاء وتم',
    preview: {
      mobile_tab: 'الجوال',
      web_tab: 'الويب',
    },
    connectors: {
      unlocked_later: 'سيتم فتحه لاحقًا',
      unlocked_later_tip:
        'بمجرد الانتهاء من عملية التسجيل والدخول إلى المنتج، ستتمكن من الوصول إلى المزيد من طرق تسجيل الدخول الاجتماعي.',
      notice:
        'يرجى تجنب استخدام موصل العرض التوضيحي لأغراض الإنتاج. بمجرد الانتهاء من الاختبار، يرجى حذف موصل العرض التوضيحي وإعداد موصلك الخاص بك ببيانات الاعتماد الخاصة بك.',
    },
  },
  socialCallback: {
    title: 'لقد قمت بتسجيل الدخول بنجاح',
    description:
      'لقد قمت بتسجيل الدخول بنجاح باستخدام حسابك الاجتماعي. لضمان التكامل السلس والوصول إلى جميع ميزات Logto، نوصي بمتابعة تكوين موصلك الاجتماعي الخاص بك.',
  },
  tenant: {
    create_tenant: 'إنشاء مستأجر',
  },
};

export default Object.freeze(cloud);
