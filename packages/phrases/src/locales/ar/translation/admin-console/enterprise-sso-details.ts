const enterprise_sso_details = {
  back_to_sso_connectors: 'العودة إلى SSO للشركات',
  page_title: 'تفاصيل موصّل SSO للشركات',
  readme_drawer_title: 'SSO للشركات',
  readme_drawer_subtitle:
    'قم بإعداد موصّلات SSO للشركات لتمكين تسجيل الدخول الموحد للمستخدمين النهائيين',
  tab_experience: 'تجربة SSO',
  tab_connection: 'الاتصال',
  tab_idp_initiated_auth: 'SSO الذي يبدأ من IdP',
  general_settings_title: 'عام',
  general_settings_description:
    'قم بتكوين تجربة المستخدم النهائي وربط نطاق البريد الإلكتروني الخاص بالشركة لتدفق SSO الذي يبدأ من SP.',
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
  idp_initiated_auth_config: {
    card_title: 'SSO الذي يبدأ من IdP',
    card_description:
      'يبدأ المستخدم عادةً عملية المصادقة من تطبيقك باستخدام تدفق SSO الذي يبدأ من SP. لا تقم بتمكين هذه الميزة إلا إذا كان ذلك ضروريًا تمامًا.',
    enable_idp_initiated_sso: 'تمكين SSO الذي يبدأ من IdP',
    enable_idp_initiated_sso_description:
      'السماح للمستخدمين الشركات ببدء عملية المصادقة مباشرة من بوابة موفر الهوية. يرجى فهم المخاطر الأمنية المحتملة قبل تمكين هذه الميزة.',
    default_application: 'التطبيق الافتراضي',
    default_application_tooltip: 'التطبيق الهدف الذي سيتم توجيه المستخدم إليه بعد المصادقة.',
    empty_applications_error:
      'لم يتم العثور على تطبيقات. يرجى إضافة واحدة في قسم <a>التطبيقات</a>.',
    empty_applications_placeholder: 'لا توجد تطبيقات',
    authentication_type: 'نوع المصادقة',
    auto_authentication_disabled_title: 'إعادة التوجيه إلى العميل لتدفق SSO الذي يبدأ من SP',
    auto_authentication_disabled_description:
      'موصى به. إعادة توجيه المستخدمين إلى تطبيق الجهة العميلة لبدء المصادقة الآمنة لـ OIDC الذي يبدأ من SP. هذا سيمنع هجمات CSRF.',
    auto_authentication_enabled_title: 'تسجيل الدخول مباشرة باستخدام SSO الذي يبدأ من IdP',
    auto_authentication_enabled_description:
      'بعد تسجيل الدخول بنجاح ، سيتم إعادة توجيه المستخدمين إلى URI إعادة التوجيه المحدد مع رمز التفويض (بدون تحقق من الحالة و PKCE).',
    auto_authentication_disabled_app: 'للتطبيقات الويب التقليدية ، تطبيقات الصفحة الواحدة (SPA)',
    auto_authentication_enabled_app: 'للتطبيقات الويب التقليدية',
    idp_initiated_auth_callback_uri: 'URI استدعاء العميل',
    idp_initiated_auth_callback_uri_tooltip:
      'URI استدعاء العميل لبدء تدفق مصادقة SSO الذي يبدأ من SP. سيتم إلحاق ssoConnectorId بالـ URI كمعامل استعلام. (e.g., https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    redirect_uri: 'URI إعادة التوجيه بعد تسجيل الدخول',
    redirect_uri_tooltip:
      'URI إعادة التوجيه لإعادة توجيه المستخدمين بعد تسجيل الدخول بنجاح. سوف يستخدم Logto هذا URI كـ OIDC URI إعادة التوجيه في طلب التفويض. استخدم URI مخصص لتدفق مصادقة SSO الذي يبدأ من IdP لمزيد من الأمان.',
    empty_redirect_uris_error: 'لم يتم تسجيل أي URI إعادة توجيه للتطبيق. يرجى إضافة واحد أولاً.',
    redirect_uri_placeholder: 'حدد URI إعادة التوجيه بعد تسجيل الدخول',
    auth_params: 'معلمات المصادقة الإضافية',
    auth_params_tooltip:
      'معلمات إضافية ليتم تمريرها في طلب التفويض. بشكل افتراضي ، سيتم طلب فقط النطاقات (openid profile)، يمكنك تحديد نطاقات إضافية أو قيمة حالة حصرية هنا. (e.g., { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: 'وثق بالبريد الإلكتروني غير المُحقق',
  trust_unverified_email_label:
    'ثق دائمًا في عناوين البريد الإلكتروني غير المُحقق منها التي يقدمها موفر الهوية',
  trust_unverified_email_tip:
    'موصل Entra ID (OIDC) لا يقدم المطالبة `email_verified`، مما يعني أن عناوين البريد الإلكتروني من Azure ليست مضمونة التحقق. بشكل افتراضي، لن يقوم Logto بمزامنة عناوين البريد الإلكتروني غير الموثوقة إلى ملف تعريف المستخدم. قم بتفعيل هذا الخيار فقط إذا كنت تثق في جميع عناوين البريد الإلكتروني من دليل Entra ID.',
  offline_access: {
    label: 'تحديث رمز الوصول',
    description:
      'قم بتمكين Google `offline` للوصول لطلب رمز التحديث ، مما يتيح لتطبيقك تحديث رمز الوصول دون إعادة تفويض المستخدم.',
  },
};

export default Object.freeze(enterprise_sso_details);
