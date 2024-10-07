const user_details = {
  page_title: 'تفاصيل المستخدم',
  back_to_users: 'العودة إلى إدارة المستخدمين',
  created_title: 'تم إنشاء هذا المستخدم بنجاح',
  created_guide: 'إليك المعلومات لمساعدة المستخدم في عملية تسجيل الدخول الخاصة بهم.',
  created_email: 'عنوان البريد الإلكتروني:',
  created_phone: 'رقم الهاتف:',
  created_username: 'اسم المستخدم:',
  created_password: 'كلمة المرور:',
  menu_delete: 'حذف',
  delete_description: 'لا يمكن التراجع عن هذا الإجراء. سيتم حذف المستخدم نهائيًا.',
  deleted: 'تم حذف المستخدم بنجاح',
  reset_password: {
    reset_title: 'هل أنت متأكد أنك تريد إعادة تعيين كلمة المرور؟',
    content:
      'لا يمكن التراجع عن هذا الإجراء. سيتم إعادة تعيين معلومات تسجيل الدخول الخاصة بالمستخدم.',
    reset_complete: 'تم إعادة تعيين هذا المستخدم',
    new_password: 'كلمة المرور الجديدة:',
  },
  tab_settings: 'الإعدادات',
  tab_roles: 'الأدوار',
  tab_logs: 'سجلات المستخدم',
  tab_organizations: 'المؤسسات',
  authentication: 'المصادقة',
  authentication_description:
    'يحتوي كل مستخدم على ملف تعريف يحتوي على جميع معلومات المستخدم. يتكون من البيانات الأساسية والهويات الاجتماعية والبيانات المخصصة.',
  user_profile: 'بيانات المستخدم',
  field_email: 'عنوان البريد الإلكتروني',
  field_phone: 'رقم الهاتف',
  field_username: 'اسم المستخدم',
  field_name: 'الاسم',
  field_avatar: 'عنوان صورة الصورة الرمزية',
  field_avatar_placeholder: 'https://your.cdn.domain/avatar.png',
  field_custom_data: 'البيانات المخصصة',
  field_custom_data_tip:
    'معلومات إضافية عن المستخدم غير مدرجة في خصائص المستخدم المحددة مسبقًا ، مثل لون المستخدم المفضل واللغة.',
  field_profile: 'الملف الشخصي',
  field_profile_tip:
    'مطالبات إضافية معيارية لـ OpenID Connect التي لم تُدرج في خصائص المستخدم. يرجى ملاحظة أن جميع الخصائص غير المعروفة ستتم إزالتها. يرجى الرجوع إلى <a> مرجع خاصية الملف الشخصي </a> لمزيد من المعلومات.',
  field_connectors: 'الروابط الاجتماعية',
  field_sso_connectors: 'روابط المؤسسات',
  custom_data_invalid: 'يجب أن تكون البيانات المخصصة كائن JSON صالح',
  profile_invalid: 'يجب أن يكون الملف الشخصي كائن JSON صالح',
  connectors: {
    connectors: 'الروابط',
    user_id: 'معرف المستخدم',
    remove: 'إزالة',
    connected: 'هذا المستخدم متصل بعدة روابط اجتماعية.',
    not_connected: 'المستخدم غير متصل بأي رابط اجتماعي',
    deletion_confirmation: 'أنت تقوم بإزالة هوية <name/> الحالية. هل أنت متأكد أنك تريد المتابعة؟',
  },
  sso_connectors: {
    connectors: 'الروابط',
    enterprise_id: 'معرف المؤسسة',
    connected: 'هذا المستخدم متصل بعدة موفري هوية المؤسسة لتسجيل الدخول الموحد.',
    not_connected: 'المستخدم غير متصل بأي موفري هوية المؤسسة لتسجيل الدخول الموحد.',
  },
  mfa: {
    field_name: 'المصادقة المتعددة العوامل',
    field_description: 'لقد قام هذا المستخدم بتمكين عوامل التحقق المتعددة للتحقق من الهوية.',
    name_column: 'عوامل التحقق المتعددة',
    field_description_empty: 'لم يقم هذا المستخدم بتمكين عوامل التحقق المتعددة للتحقق من الهوية.',
    deletion_confirmation:
      'أنت تقوم بإزالة <name/> الحالية للتحقق المتعدد من عوامل التحقق. هل أنت متأكد أنك تريد المتابعة؟',
  },
  suspended: 'موقوف',
  suspend_user: 'تعليق المستخدم',
  suspend_user_reminder:
    'هل أنت متأكد أنك تريد تعليق هذا المستخدم؟ لن يتمكن المستخدم من تسجيل الدخول إلى تطبيقك ولن يتمكن من الحصول على رمز وصول جديد بعد انتهاء الحالي. بالإضافة إلى ذلك ، ستفشل أي طلبات API التي يقوم بها هذا المستخدم.',
  suspend_action: 'تعليق',
  user_suspended: 'تم تعليق المستخدم.',
  reactivate_user: 'إعادة تفعيل المستخدم',
  reactivate_user_reminder:
    'هل أنت متأكد أنك تريد إعادة تفعيل هذا المستخدم؟ سيتمكن المستخدم من محاولات تسجيل الدخول لهذا المستخدم.',
  reactivate_action: 'إعادة تفعيل',
  user_reactivated: 'تم إعادة تفعيل المستخدم.',
  roles: {
    name_column: 'دور المستخدم',
    description_column: 'الوصف',
    assign_button: 'تعيين الأدوار',
    delete_description:
      'سيؤدي هذا الإجراء إلى إزالة هذا الدور من هذا المستخدم. سيظل الدور نفسه قائمًا ، ولكنه لن يكون مرتبطًا بعد الآن بالمستخدم.',
    deleted: 'تمت إزالة {{name}} بنجاح من هذا المستخدم.',
    assign_title: 'تعيين الأدوار لـ {{name}}',
    assign_subtitle:
      'ابحث عن الأدوار المناسبة للمستخدم عن طريق البحث بالاسم أو الوصف أو معرف الدور.',
    assign_role_field: 'تعيين الأدوار',
    role_search_placeholder: 'البحث بواسطة اسم الدور',
    added_text: '{{value, number}} تمت الإضافة',
    assigned_user_count: '{{value, number}} مستخدمين',
    confirm_assign: 'تعيين الأدوار',
    role_assigned: 'تم تعيين الدور (الأدوار) بنجاح',
    search: 'البحث بواسطة اسم الدور أو الوصف أو المعرف',
    empty: 'لا توجد أدوار متاحة',
  },
  warning_no_sign_in_identifier:
    'يحتاج المستخدم إلى وجود واحد على الأقل من معرفات تسجيل الدخول (اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف أو الوسائط الاجتماعية) لتسجيل الدخول. هل أنت متأكد أنك تريد المتابعة؟',
  personal_access_tokens: {
    /** UNTRANSLATED */
    title: 'Personal access token',
    /** UNTRANSLATED */
    title_other: 'Personal access tokens',
    /** UNTRANSLATED */
    title_short: 'token',
    /** UNTRANSLATED */
    empty: 'The user does not have any personal access tokens.',
    /** UNTRANSLATED */
    create: 'Create new token',
    /** UNTRANSLATED */
    tip: 'Personal access tokens (PATs) provide a secure way for users to grant access tokens without using their credentials and interactive sign-in. This is useful for CI/CD, scripts, or applications that need to access resources programmatically. <a>Learn more</a>',
    /** UNTRANSLATED */
    value: 'Value',
    /** UNTRANSLATED */
    created_at: 'Created at',
    /** UNTRANSLATED */
    expires_at: 'Expires at',
    /** UNTRANSLATED */
    never: 'Never',
    /** UNTRANSLATED */
    create_new_token: 'Create new token',
    /** UNTRANSLATED */
    delete_confirmation:
      'This action cannot be undone. Are you sure you want to delete this token?',
    /** UNTRANSLATED */
    expired: 'Expired',
    /** UNTRANSLATED */
    expired_tooltip: 'This token was expired on {{date}}.',
    create_modal: {
      /** UNTRANSLATED */
      title: 'Create personal access token',
      /** UNTRANSLATED */
      expiration: 'Expiration',
      /** UNTRANSLATED */
      expiration_description: 'The token will expire at {{date}}.',
      /** UNTRANSLATED */
      expiration_description_never:
        'The token will never expire. We recommend setting an expiration date for enhanced security.',
      /** UNTRANSLATED */
      days: '{{count}} day',
      /** UNTRANSLATED */
      days_other: '{{count}} days',
      /** UNTRANSLATED */
      created: 'The token {{name}} has been successfully created.',
    },
    edit_modal: {
      /** UNTRANSLATED */
      title: 'Edit personal access token',
      /** UNTRANSLATED */
      edited: 'The token {{name}} has been successfully edited.',
    },
  },
};

export default Object.freeze(user_details);
