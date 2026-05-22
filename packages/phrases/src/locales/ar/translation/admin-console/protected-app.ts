const protected_app = {
  name: 'تطبيق محمي',
  title: 'إنشاء تطبيق محمي: إضافة المصادقة بسهولة وسرعة رائعة',
  fast_create: 'إنشاء سريع',
  modal_title: 'إنشاء تطبيق محمي',
  modal_subtitle:
    'قم بتمكين الحماية الآمنة والسريعة بنقرات قليلة. أضف المصادقة إلى تطبيق الويب الحالي الخاص بك بسهولة.',
  form: {
    url_field_label: 'عنوان URL الأصلي الخاص بك',
    url_field_placeholder: 'https://domain.com/',
    url_field_description: 'قدم عنوان تطبيقك الذي يحتاج إلى حماية المصادقة.',
    url_field_modification_notice:
      'قد يستغرق تحديث عنوان URL الأصلي من 1 إلى 2 دقيقة ليصبح فعالًا في جميع مواقع الشبكة العالمية.',
    url_field_tooltip:
      'قدم عنوان تطبيقك ، باستثناء أي "/ pathname". بعد الإنشاء ، يمكنك تخصيص قواعد مصادقة المسار.',
    domain_field_label: 'نطاق التطبيق',
    domain_field_placeholder: 'نطاقك',
    domain_field_description:
      'يعمل هذا العنوان كوكيل حماية المصادقة لعنوان URL الأصلي. يمكن تطبيق النطاق المخصص بعد الإنشاء.',
    domain_field_description_short: 'يعمل هذا العنوان كوكيل حماية المصادقة لعنوان URL الأصلي.',
    domain_field_tooltip:
      'سيتم استضافة التطبيقات المحمية بواسطة Logto في "نطاقك.{{domain}}" افتراضيًا. يمكن تطبيق النطاق المخصص بعد الإنشاء.',
    create_application: 'إنشاء التطبيق',
    create_protected_app: 'إنشاء سريع',
    errors: {
      domain_required: 'مطلوب نطاقك.',
      domain_in_use: 'اسم النطاق الفرعي هذا مستخدم بالفعل.',
      invalid_domain_format:
        'تنسيق النطاق الفرعي غير صالح: استخدم فقط الأحرف الصغيرة والأرقام والشرطات "-".',
      url_required: 'مطلوب عنوان URL الأصلي.',
      invalid_url:
        'تنسيق عنوان URL الأصلي غير صالح: استخدم http:// أو https://. ملاحظة: "/ pathname" غير مدعوم حاليًا.',
      localhost:
        'يرجى تعريض خادمك المحلي للإنترنت أولاً. تعرف على المزيد حول <a>التطوير المحلي</a>.',
    },
  },
  id_token_claims: {
    card_title: 'مطالبات ID token',
    card_description:
      'اطلب نطاقات (scope) مستخدم إضافية أثناء تسجيل الدخول للتطبيق المحمي لتضمين المطالبات الموسعة المفعلة في ID token الذي يتم تمريره.',
    field_title: 'نطاقات إضافية',
    field_description:
      'يتم تضمين المطالبات فقط عند تمكينها في <a>Custom JWT > ID token</a> وعند طلب النطاق المطابق هنا.',
    table_column_scope: 'النطاق',
    table_column_claims_forwarded: 'المطالبات المُمررة',
    disabled_claims_hint:
      'المطالبات الرمادية غير مُمررة بعد. قم بتمكينها في <a>Custom JWT > ID token</a> لتضمينها في ID token.',
  },
  success_message: '🎉 تم تمكين المصادقة على التطبيق بنجاح! استكشف تجربة موقع الويب الجديدة.',
};

export default Object.freeze(protected_app);
