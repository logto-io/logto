const jwt_claims = {
  title: 'JWT المخصص',
  description:
    'قم بإعداد مطالبات JWT المخصصة لتضمينها في رمز الوصول. يمكن استخدام هذه المطالبات لتمرير معلومات إضافية إلى تطبيقك.',
  user_jwt: {
    card_title: 'للمستخدم',
    card_field: 'رمز الوصول للمستخدم',
    card_description: 'إضافة بيانات محددة للمستخدم أثناء إصدار رمز الوصول.',
    for: 'للمستخدم',
  },
  machine_to_machine_jwt: {
    card_title: 'للآلة إلى الآلة',
    card_field: 'رمز الوصول من الآلة إلى الآلة',
    card_description: 'إضافة بيانات إضافية أثناء إصدار رمز الوصول من الآلة إلى الآلة.',
    for: 'للآلة إلى الآلة',
  },
  code_editor_title: 'تخصيص مطالبات {{token}}',
  custom_jwt_create_button: 'إضافة مطالبات مخصصة',
  custom_jwt_item: 'مطالبات مخصصة {{for}}',
  delete_modal_title: 'حذف المطالبات المخصصة',
  delete_modal_content: 'هل أنت متأكد أنك تريد حذف المطالبات المخصصة؟',
  clear: 'مسح',
  cleared: 'تم المسح',
  restore: 'استعادة الافتراضيات',
  restored: 'تمت الاستعادة',
  data_source_tab: 'مصدر البيانات',
  test_tab: 'سياق الاختبار',
  jwt_claims_description: 'المطالبات الافتراضية مضمنة تلقائيًا في JWT ولا يمكن استبدالها.',
  user_data: {
    title: 'بيانات المستخدم',
    subtitle: 'استخدم معلمة الإدخال `context.user` لتوفير معلومات المستخدم الحيوية.',
  },
  grant_data: {
    title: 'بيانات المنحة',
    subtitle:
      'استخدم معلمة الإدخال `context.grant` لتوفير معلومات المنحة الحيوية، متاحة فقط لتبادل الرموز.',
  },
  interaction_data: {
    title: 'سياق تفاعل المستخدم',
    subtitle:
      'استخدم المعلمة `context.interaction` للوصول إلى تفاصيل تفاعل المستخدم في جلسة المصادقة الحالية، بما في ذلك `interactionEvent`, `userId`, و `verificationRecords`.',
  },
  token_data: {
    title: 'بيانات الرمز',
    subtitle: 'استخدم معلمة الإدخال `token` لحمولة رمز الوصول الحالي.',
  },
  api_context: {
    title: 'سياق API: التحكم في الوصول',
    subtitle: 'استخدم طريقة `api.denyAccess` لرفض طلب الرمز.',
  },
  fetch_external_data: {
    title: 'استرجاع البيانات الخارجية',
    subtitle: 'دمج البيانات من واجهات برمجة التطبيقات الخارجية مباشرة في المطالبات.',
    description:
      'استخدم وظيفة `fetch` لاستدعاء واجهات برمجة التطبيقات الخارجية الخاصة بك وتضمين البيانات في المطالبات المخصصة الخاصة بك. مثال: ',
  },
  environment_variables: {
    title: 'تعيين متغيرات البيئة',
    subtitle: 'استخدم متغيرات البيئة لتخزين المعلومات الحساسة.',
    input_field_title: 'إضافة متغيرات البيئة',
    sample_code: 'الوصول إلى متغيرات البيئة في معالج المطالبات JWT المخصص الخاص بك. مثال: ',
  },
  jwt_claims_hint:
    'قم بتقييد المطالبات المخصصة إلى أقل من 50 كيلوبايت. المطالبات الافتراضية في JWT مضمنة تلقائيًا في الرمز ولا يمكن استبدالها.',
  tester: {
    subtitle: 'ضبط رمز وبيانات المستخدم الوهمية للاختبار.',
    run_button: 'تشغيل الاختبار',
    result_title: 'نتيجة الاختبار',
  },
  form_error: {
    invalid_json: 'تنسيق JSON غير صالح',
  },
};

export default Object.freeze(jwt_claims);
