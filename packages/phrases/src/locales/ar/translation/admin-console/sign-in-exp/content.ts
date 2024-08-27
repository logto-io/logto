const content = {
  terms_of_use: {
    title: 'الشروط',
    terms_of_use: 'رابط شروط الاستخدام',
    terms_of_use_placeholder: 'https://your.terms.of.use/',
    privacy_policy: 'رابط سياسة الخصوصية',
    privacy_policy_placeholder: 'https://your.privacy.policy/',
    agree_to_terms: 'موافقة على الشروط',
    agree_policies: {
      automatic: 'الموافقة التلقائية على الشروط',
      manual_registration_only: 'الموافقة عبر خانة الاختيار في عملية التسجيل فقط',
      manual: 'الموافقة عبر خانة الاختيار في عملية التسجيل وتسجيل الدخول',
    },
  },
  languages: {
    title: 'اللغات',
    enable_auto_detect: 'تمكين الكشف التلقائي',
    description:
      'يكتشف البرنامج الخاص بك إعدادات لغة المستخدم ويقوم بالتبديل إلى اللغة المحلية. يمكنك إضافة لغات جديدة عن طريق ترجمة واجهة المستخدم من الإنجليزية إلى لغة أخرى.',
    manage_language: 'إدارة اللغة',
    default_language: 'اللغة الافتراضية',
    default_language_description_auto:
      'سيتم استخدام اللغة الافتراضية عندما لا يتم تغطية لغة المستخدم المكتشفة في مكتبة اللغة الحالية.',
    default_language_description_fixed:
      'عند تعطيل الكشف التلقائي، اللغة الافتراضية هي اللغة الوحيدة التي سيعرضها البرنامج الخاص بك. قم بتشغيل الكشف التلقائي لتوسيع اللغة.',
  },
  manage_language: {
    title: 'إدارة اللغة',
    subtitle:
      'قم بتعريب تجربة المنتج عن طريق إضافة لغات وترجمات. يمكن تعيين مساهمتك كلغة افتراضية.',
    add_language: 'إضافة لغة',
    logto_provided: 'توفرها Logto',
    key: 'مفتاح',
    logto_source_values: 'قيم المصدر Logto',
    custom_values: 'قيم مخصصة',
    clear_all_tip: 'مسح جميع القيم',
    unsaved_description: 'لن يتم حفظ التغييرات إذا غادرت هذه الصفحة دون حفظها.',
    deletion_tip: 'حذف اللغة',
    deletion_title: 'هل ترغب في حذف اللغة المضافة؟',
    deletion_description: 'بعد الحذف، لن يتمكن مستخدموك من التصفح باللغة المحذوفة مرة أخرى.',
    default_language_deletion_title: 'لا يمكن حذف اللغة الافتراضية.',
    default_language_deletion_description: 'تم تعيين {{language}} كلغتك الافتراضية ولا يمكن حذفها.',
  },
};

export default Object.freeze(content);
