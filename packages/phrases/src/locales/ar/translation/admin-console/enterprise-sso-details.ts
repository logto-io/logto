const enterprise_sso_details = {
  back_to_sso_connectors: 'العودة إلى SSO للشركات',
  page_title: 'تفاصيل موصّل SSO للشركات',
  readme_drawer_title: 'SSO للشركات',
  readme_drawer_subtitle:
    'قم بإعداد موصّلات SSO للشركات لتمكين تسجيل الدخول الموحد للمستخدمين النهائيين',
  tab_experience: 'تجربة SSO',
  tab_connection: 'الاتصال',
  general_settings_title: 'عام',
  custom_branding_title: 'العرض',
  custom_branding_description:
    'قم بتخصيص الاسم والشعار المعروضين في تدفق تسجيل الدخول الموحد للمستخدمين النهائيين. عندما يكون فارغًا ، يتم استخدام القيم الافتراضية.',
  email_domain_field_name: 'نطاقات البريد الإلكتروني للشركة',
  email_domain_field_description:
    'يمكن للمستخدمين الذين لديهم هذه النطاقات البريدية استخدام SSO للمصادقة. يرجى التحقق من ملكية النطاق قبل الإضافة.',
  email_domain_field_placeholder:
    'أدخل نطاقات البريد الإلكتروني واحدة أو أكثر (على سبيل المثال yourcompany.com)',
  sync_profile_field_name: 'مزامنة معلومات الملف الشخصي من موفر الهوية',
  sync_profile_option: {
    register_only: 'مزامنة فقط عند تسجيل الدخول الأول',
    each_sign_in: 'مزامنة دائمًا عند كل تسجيل دخول',
  },
  connector_name_field_name: 'اسم الموصّل',
  display_name_field_name: 'اسم العرض',
  connector_logo_field_name: 'شعار العرض',
  connector_logo_field_description:
    'يجب أن يكون كل صورة أقل من 500 كيلوبايت ، SVG ، PNG ، JPG ، JPEG فقط.',
  branding_logo_context: 'تحميل الشعار',
  branding_logo_error: 'خطأ في تحميل الشعار: {{error}}',
  branding_light_logo_context: 'تحميل شعار الوضع الفاتح',
  branding_light_logo_error: 'خطأ في تحميل شعار الوضع الفاتح: {{error}}',
  branding_logo_field_name: 'الشعار',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: 'تحميل شعار الوضع الداكن',
  branding_dark_logo_error: 'خطأ في تحميل شعار الوضع الداكن: {{error}}',
  branding_dark_logo_field_name: 'الشعار (الوضع الداكن)',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_connection_guide: 'دليل الاتصال',
  enterprise_sso_deleted: 'تم حذف موصّل SSO للشركات بنجاح',
  delete_confirm_modal_title: 'حذف موصّل SSO للشركات',
  delete_confirm_modal_content:
    'هل أنت متأكد أنك تريد حذف هذا الموصّل الشركات؟ لن يستخدم المستخدمون من موفري الهوية تسجيل الدخول الموحد.',
  upload_idp_metadata_title_saml: 'تحميل البيانات الوصفية',
  upload_idp_metadata_description_saml: 'قم بتكوين البيانات الوصفية المنسوخة من موفر الهوية.',
  upload_idp_metadata_title_oidc: 'تحميل بيانات الاعتمادات',
  upload_idp_metadata_description_oidc:
    'قم بتكوين بيانات الاعتمادات ومعلومات رمز OIDC المنسوخة من موفر الهوية.',
  upload_idp_metadata_button_text: 'تحميل ملف البيانات الوصفية بتنسيق XML',
  upload_signing_certificate_button_text: 'تحميل ملف شهادة التوقيع',
  configure_domain_field_info_text:
    'أضف نطاق البريد الإلكتروني لتوجيه المستخدمين الشركات إلى موفر هويتهم لتسجيل الدخول الموحد.',
  email_domain_field_required: 'مطلوب نطاق البريد الإلكتروني لتمكين SSO للشركات.',
  upload_saml_idp_metadata_info_text_url:
    'قم بلصق عنوان URL للبيانات الوصفية من موفر الهوية للاتصال.',
  upload_saml_idp_metadata_info_text_xml: 'قم بلصق البيانات الوصفية من موفر الهوية للاتصال.',
  upload_saml_idp_metadata_info_text_manual: 'املأ البيانات الوصفية من موفر الهوية للاتصال.',
  upload_oidc_idp_info_text: 'املأ المعلومات من موفر الهوية للاتصال.',
  service_provider_property_title: 'قم بالتكوين في موفر الهوية',
  service_provider_property_description:
    'قم بإعداد تكامل التطبيق باستخدام {{protocol}} في موفر الهوية الخاص بك. أدخل التفاصيل المقدمة من قِبل Logto.',
  attribute_mapping_title: 'تعيينات السمات',
  attribute_mapping_description:
    'قم بمزامنة ملفات تعريف المستخدمين من موفر الهوية عن طريق تكوين تعيين السمات للمستخدم إما على جانب موفر الهوية أو جانب Logto.',
  saml_preview: {
    sign_on_url: 'عنوان URL لتسجيل الدخول',
    entity_id: 'المُصدر',
    x509_certificate: 'شهادة التوقيع',
    certificate_content: 'تنتهي صلاحيتها في {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'نقطة الوصول للتفويض',
    token_endpoint: 'نقطة الوصول للرمز',
    userinfo_endpoint: 'نقطة وصول معلومات المستخدم',
    jwks_uri: 'نقطة وصول مجموعة مفاتيح JSON',
    issuer: 'المُصدر',
  },
};

export default Object.freeze(enterprise_sso_details);
