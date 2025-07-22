const profile = {
  page_title: 'إعدادات الحساب',
  title: 'إعدادات الحساب',
  description: 'قم بتغيير إعدادات حسابك وإدارة معلوماتك الشخصية هنا لضمان أمان حسابك.',
  settings: {
    title: 'إعدادات الملف الشخصي',
    profile_information: 'معلومات الملف الشخصي',
    avatar: 'الصورة الرمزية',
    name: 'الاسم',
    username: 'اسم المستخدم',
  },
  link_account: {
    title: 'ربط الحساب',
    email_sign_in: 'تسجيل الدخول بالبريد الإلكتروني',
    email: 'البريد الإلكتروني',
    social_sign_in: 'تسجيل الدخول بوسائل التواصل الاجتماعي',
    link_email: 'ربط البريد الإلكتروني',
    link_email_subtitle: 'قم بربط بريدك الإلكتروني لتسجيل الدخول أو للمساعدة في استعادة الحساب.',
    email_required: 'البريد الإلكتروني مطلوب',
    invalid_email: 'عنوان البريد الإلكتروني غير صالح',
    identical_email_address: 'عنوان البريد الإلكتروني المدخل مطابق للحالي',
    anonymous: 'مجهول',
  },
  password: {
    title: 'كلمة المرور والأمان',
    password: 'كلمة المرور',
    password_setting: 'إعداد كلمة المرور',
    new_password: 'كلمة المرور الجديدة',
    confirm_password: 'تأكيد كلمة المرور',
    enter_password: 'أدخل كلمة المرور الحالية',
    enter_password_subtitle:
      'تحقق من أنه أنت لحماية أمان حسابك. يرجى إدخال كلمة المرور الحالية قبل تغييرها.',
    set_password: 'تعيين كلمة المرور',
    verify_via_password: 'التحقق عبر كلمة المرور',
    show_password: 'إظهار كلمة المرور',
    required: 'كلمة المرور مطلوبة',
    do_not_match: 'كلمات المرور غير متطابقة. يرجى المحاولة مرة أخرى.',
  },
  code: {
    enter_verification_code: 'أدخل رمز التحقق',
    enter_verification_code_subtitle: 'تم إرسال رمز التحقق إلى <strong>{{target}}</strong>',
    verify_via_code: 'التحقق عبر رمز التحقق',
    resend: 'إعادة إرسال رمز التحقق',
    resend_countdown: 'إعادة إرسال في {{countdown}} ثانية',
  },
  delete_account: {
    title: 'حذف الحساب',
    label: 'حذف الحساب',
    description:
      'سيؤدي حذف حسابك إلى إزالة جميع المعلومات الشخصية وبيانات المستخدم والتكوين. لا يمكن التراجع عن هذا الإجراء.',
    button: 'حذف الحساب',
    p: {
      has_issue:
        'نأسف لسماع أنك ترغب في حذف حسابك. قبل أن تتمكن من حذف حسابك ، يجب عليك حل المشكلات التالية.',
      after_resolved:
        'بمجرد حل المشكلات ، يمكنك حذف حسابك. يرجى عدم التردد في الاتصال بنا إذا كنت بحاجة إلى أي مساعدة.',
      check_information:
        'نأسف لسماع أنك ترغب في حذف حسابك. يرجى التحقق من المعلومات التالية بعناية قبل المتابعة.',
      remove_all_data:
        'سيؤدي حذف حسابك إلى إزالة جميع البيانات المتعلقة بك في Logto Cloud. لذا يرجى التأكد من نسخ أي بيانات مهمة قبل المتابعة.',
      confirm_information:
        'يرجى تأكيد أن المعلومات أعلاه هي ما تتوقعه. بمجرد حذف حسابك ، لن نتمكن من استعادته.',
      has_admin_role: 'نظرًا لأن لديك دور المسؤول في المستأجر التالي ، سيتم حذفه مع حسابك:',
      has_admin_role_other:
        'نظرًا لأن لديك دور المسؤول في المستأجرات التالية ، سيتم حذفها مع حسابك:',
      quit_tenant: 'أنت على وشك الخروج من المستأجر التالي:',
      quit_tenant_other: 'أنت على وشك الخروج من المستأجرات التالية:',
    },
    issues: {
      paid_plan: 'المستأجر التالي لديه خطة مدفوعة ، يرجى إلغاء الاشتراك أولاً:',
      paid_plan_other: 'المستأجرات التالية لديها خطط مدفوعة ، يرجى إلغاء الاشتراك أولاً:',
      subscription_status: 'المستأجر التالي لديه مشكلة في حالة الاشتراك:',
      subscription_status_other: 'المستأجرات التالية لديها مشكلات في حالة الاشتراك:',
      open_invoice: 'المستأجر التالي لديه فاتورة مفتوحة:',
      open_invoice_other: 'المستأجرات التالية لديها فواتير مفتوحة:',
    },
    error_occurred: 'حدث خطأ',
    error_occurred_description: 'عذرًا ، حدث خطأ ما أثناء حذف حسابك:',
    request_id: 'معرف الطلب: {{requestId}}',
    try_again_later:
      'يرجى المحاولة مرة أخرى في وقت لاحق. إذا استمرت المشكلة ، يرجى الاتصال بفريق Logto مع معرف الطلب.',
    final_confirmation: 'تأكيد نهائي',
    about_to_start_deletion: 'أنت على وشك بدء عملية الحذف ولا يمكن التراجع عن هذا الإجراء.',
    permanently_delete: 'حذف بشكل دائم',
  },
  set: 'تعيين',
  change: 'تغيير',
  link: 'ربط',
  unlink: 'إلغاء الربط',
  not_set: 'غير محدد',
  change_avatar: 'تغيير الصورة الرمزية',
  change_name: 'تغيير الاسم',
  change_username: 'تغيير اسم المستخدم',
  set_name: 'تعيين الاسم',
  email_changed: 'تم تغيير البريد الإلكتروني.',
  password_changed: 'تم تغيير كلمة المرور.',
  updated: 'تم تحديث {{target}}.',
  linked: 'تم ربط {{target}}.',
  unlinked: 'تم إلغاء ربط {{target}}.',
  email_exists_reminder:
    'هذا البريد الإلكتروني {{email}} مرتبط بحساب موجود بالفعل. ربط بريد إلكتروني آخر هنا.',
  unlink_confirm_text: 'نعم ، إلغاء الربط',
  unlink_reminder:
    'لن يتمكن المستخدمون من تسجيل الدخول باستخدام حساب <span></span> إذا قمت بإلغاء الربط. هل أنت متأكد من المتابعة؟',
  fields: {
    /** UNTRANSLATED */
    name: 'Name',
    /** UNTRANSLATED */
    avatar: 'Avatar',
    /** UNTRANSLATED */
    familyName: 'Family name',
    /** UNTRANSLATED */
    givenName: 'Given name',
    /** UNTRANSLATED */
    middleName: 'Middle name',
    /** UNTRANSLATED */
    nickname: 'Nickname',
    /** UNTRANSLATED */
    preferredUsername: 'Preferred username',
    /** UNTRANSLATED */
    profile: 'Profile',
    /** UNTRANSLATED */
    website: 'Website',
    /** UNTRANSLATED */
    gender: 'Gender',
    /** UNTRANSLATED */
    birthdate: 'Birthdate',
    /** UNTRANSLATED */
    zoneinfo: 'Timezone',
    /** UNTRANSLATED */
    locale: 'Language',
    address: {
      /** UNTRANSLATED */
      formatted: 'Address',
      /** UNTRANSLATED */
      streetAddress: 'Street address',
      /** UNTRANSLATED */
      locality: 'City',
      /** UNTRANSLATED */
      region: 'State',
      /** UNTRANSLATED */
      postalCode: 'Zip code',
      /** UNTRANSLATED */
      country: 'Country',
    },
  },
};

export default Object.freeze(profile);
