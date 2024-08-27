const connector_details = {
  page_title: 'تفاصيل الموصل',
  back_to_connectors: 'العودة إلى الموصلات',
  check_readme: 'تحقق من README',
  settings: 'الإعدادات العامة',
  settings_description:
    'تلعب الموصلات دورًا حاسمًا في Logto. بمساعدتها ، يتيح Logto للمستخدمين النهائيين استخدام التسجيل أو تسجيل الدخول بدون كلمة مرور وإمكانيات تسجيل الدخول باستخدام حسابات اجتماعية.',
  parameter_configuration: 'تكوين المعلمة',
  test_connection: 'اختبار',
  save_error_empty_config: 'يرجى إدخال التكوين',
  send: 'إرسال',
  send_error_invalid_format: 'إدخال غير صالح',
  edit_config_label: 'أدخل JSON الخاص بك هنا',
  test_email_sender: 'اختبار موصل البريد الإلكتروني الخاص بك',
  test_sms_sender: 'اختبار موصل الرسائل القصيرة الخاص بك',
  test_email_placeholder: 'john.doe@example.com',
  test_sms_placeholder: '+1 555-123-4567',
  test_message_sent: 'تم إرسال رسالة الاختبار',
  test_sender_description:
    'يستخدم Logto القالب "العام" للفحص. ستتلقى رسالة إذا تم تكوين الموصل الخاص بك بشكل صحيح.',
  options_change_email: 'تغيير موصل البريد الإلكتروني',
  options_change_sms: 'تغيير موصل الرسائل القصيرة',
  connector_deleted: 'تم حذف الموصل بنجاح',
  type_email: 'موصل البريد الإلكتروني',
  type_sms: 'موصل الرسائل القصيرة',
  type_social: 'موصل اجتماعي',
  in_used_social_deletion_description:
    'هذا الموصل قيد الاستخدام في تجربة تسجيل الدخول الخاصة بك. عن طريق الحذف ، سيتم حذف تجربة تسجيل الدخول <name/> في إعدادات تجربة تسجيل الدخول. ستحتاج إلى إعادة تكوينه إذا قررت إضافته مرة أخرى.',
  in_used_passwordless_deletion_description:
    'هذا {{name}} قيد الاستخدام في تجربة تسجيل الدخول الخاصة بك. عن طريق الحذف ، لن تعمل تجربة تسجيل الدخول الخاصة بك بشكل صحيح حتى تحل الصراع. ستحتاج إلى إعادة تكوينه إذا قررت إضافته مرة أخرى.',
  deletion_description:
    'أنت تقوم بإزالة هذا الموصل. لا يمكن التراجع عنها ، وستحتاج إلى إعادة تكوينه إذا قررت إضافته مرة أخرى.',
  logto_email: {
    total_email_sent: 'إجمالي البريد الإلكتروني المرسل: {{value, number}}',
    total_email_sent_tip:
      'يستخدم Logto SendGrid للبريد الإلكتروني المدمج الآمن والمستقر. إنه مجاني تمامًا للاستخدام. <a>تعرف على المزيد</a>',
    email_template_title: 'قالب البريد الإلكتروني',
    template_description:
      'يستخدم البريد الإلكتروني المدمج قوالب افتراضية لتسليم سلس لرسائل التحقق. لا يلزم أي تكوين ، ويمكنك تخصيص معلومات العلامة التجارية الأساسية.',
    template_description_link_text: 'عرض القوالب',
    description_action_text: 'عرض القوالب',
    from_email_field: 'عنوان البريد الإلكتروني المرسل',
    sender_name_field: 'اسم المرسل',
    sender_name_tip:
      'قم بتخصيص اسم المرسل للرسائل الإلكترونية. إذا تركته فارغًا ، سيتم استخدام "التحقق" كاسم افتراضي.',
    sender_name_placeholder: 'اسم المرسل الخاص بك',
    company_information_field: 'معلومات الشركة',
    company_information_description:
      'عرض اسم الشركة أو العنوان أو الرمز البريدي في أسفل الرسائل الإلكترونية لتعزيز المصداقية.',
    company_information_placeholder: 'معلومات الشركة الأساسية',
    email_logo_field: 'شعار البريد الإلكتروني',
    email_logo_tip:
      'عرض شعار العلامة التجارية الخاصة بك في أعلى الرسائل الإلكترونية. استخدم نفس الصورة لكل من وضع الضوء الفاتح ووضع الضوء الداكن.',
    urls_not_allowed: 'غير مسموح بالروابط',
    test_notes: 'يستخدم Logto القالب "العام" للفحص.',
  },
  google_one_tap: {
    title: 'Google One Tap',
    description:
      'Google One Tap هو طريقة آمنة وسهلة للمستخدمين لتسجيل الدخول إلى موقع الويب الخاص بك.',
    enable_google_one_tap: 'تمكين Google One Tap',
    enable_google_one_tap_description:
      'تمكين Google One Tap في تجربة تسجيل الدخول الخاصة بك: اسمح للمستخدمين بالتسجيل أو تسجيل الدخول بسرعة باستخدام حساب Google الخاص بهم إذا كانوا قد قاموا بتسجيل الدخول بالفعل على جهازهم.',
    configure_google_one_tap: 'تكوين Google One Tap',
    auto_select: 'تحديد الاعتمادية تلقائيًا إذا أمكن',
    close_on_tap_outside: 'إلغاء الإشعار إذا قام المستخدم بالنقر / الضغط خارجه',
    itp_support: 'تمكين <a>تجربة مستخدم محسنة لـ One Tap على متصفحات ITP</a>',
  },
};

export default Object.freeze(connector_details);
