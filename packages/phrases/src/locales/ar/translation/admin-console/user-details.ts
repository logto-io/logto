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
    generate_title: 'هل أنت متأكد أنك تريد توليد كلمة مرور؟',
    content:
      'لا يمكن التراجع عن هذا الإجراء. سيتم إعادة تعيين معلومات تسجيل الدخول الخاصة بالمستخدم.',
    reset_complete: 'تم إعادة تعيين هذا المستخدم',
    generate_complete: 'تم توليد كلمة المرور',
    new_password: 'كلمة المرور الجديدة:',
    password: 'كلمة المرور:',
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
  field_password: 'كلمة المرور',
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
  password_already_set: 'تم تعيين كلمة المرور بالفعل',
  no_password_set: 'لم يتم تعيين كلمة مرور',
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
    title: 'رمز الوصول الشخصي',
    title_other: 'رموز الوصول الشخصية',
    title_short: 'رمز',
    empty: 'المستخدم لا يمتلك أي رموز وصول شخصية.',
    create: 'إنشاء رمز جديد',
    tip: 'توفر رموز الوصول الشخصية (PATs) طريقة آمنة للمستخدمين لمنح رموز الوصول دون استخدام بيانات اعتمادهم وتسجيل الدخول التفاعلي. هذا مفيد لـ CI/CD، النصوص، أو التطبيقات التي تحتاج إلى الوصول إلى الموارد برمجيًا.',
    value: 'القيمة',
    created_at: 'تم إنشاؤه في',
    expires_at: 'ينتهي في',
    never: 'أبدًا',
    create_new_token: 'إنشاء رمز جديد',
    delete_confirmation: 'لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد أنك تريد حذف هذا الرمز؟',
    expired: 'منتهي الصلاحية',
    expired_tooltip: 'انتهت صلاحية هذا الرمز في {{date}}.',
    create_modal: {
      title: 'إنشاء رمز الوصول الشخصي',
      expiration: 'انتهاء الصلاحية',
      expiration_description: 'سينتهي الرمز في {{date}}.',
      expiration_description_never:
        'لن تنتهي صلاحية الرمز أبدًا. نوصي بتحديد تاريخ انتهاء لتعزيز الأمان.',
      days: '{{count}} يوم',
      days_other: '{{count}} أيام',
      created: 'تم إنشاء الرمز {{name}} بنجاح.',
    },
    edit_modal: {
      title: 'تحرير رمز الوصول الشخصي',
      edited: 'تم تحرير الرمز {{name}} بنجاح.',
    },
  },
  connections: {
    /** UNTRANSLATED */
    title: 'Connection',
    /** UNTRANSLATED */
    description:
      'The user links third-party accounts for social sign-in, enterprise SSO, or resources access.',
    /** UNTRANSLATED */
    token_status_column: 'Token status',
    token_status: {
      /** UNTRANSLATED */
      active: 'Active',
      /** UNTRANSLATED */
      expired: 'Expired',
      /** UNTRANSLATED */
      inactive: 'Inactive',
      /** UNTRANSLATED */
      not_applicable: 'Not applicable',
    },
  },
};

export default Object.freeze(user_details);
