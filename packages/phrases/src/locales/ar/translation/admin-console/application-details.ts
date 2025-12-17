const application_details = {
  page_title: 'تفاصيل التطبيق',
  back_to_applications: 'العودة إلى التطبيقات',
  check_guide: 'تحقق من الدليل',
  settings: 'الإعدادات',
  settings_description:
    '"التطبيق" هو برنامج أو خدمة مسجَّلة يمكنها الوصول إلى معلومات المستخدم أو التصرف نيابةً عنه. تساعد التطبيقات Logto على معرفة من يطلب ماذا، وتتولى إدارة تسجيل الدخول والصلاحيات. املأ الحقول المطلوبة لإتمام المصادقة.',
  integration: 'التكامل',
  integration_description:
    'نشر مع العمال الآمنة لـ Logto ، المدعومة بشبكة Cloudflare للأداء على أعلى مستوى وبدء بارد بدون تأخير في جميع أنحاء العالم.',
  service_configuration: 'تكوين الخدمة',
  service_configuration_description: 'أكمل التكوينات اللازمة في خدمتك.',
  session: 'الجلسة',
  endpoints_and_credentials: 'نقاط النهاية وبيانات الاعتماد',
  endpoints_and_credentials_description:
    'استخدم نقاط النهاية وبيانات الاعتماد التالية لإعداد اتصال OIDC في التطبيق الخاص بك.',
  refresh_token_settings: 'رمز التحديث',
  refresh_token_settings_description: 'إدارة قواعد رمز التحديث لهذا التطبيق.',
  machine_logs: 'سجلات الجهاز',
  application_name: 'اسم التطبيق',
  application_name_placeholder: 'تطبيقي',
  description: 'الوصف',
  description_placeholder: 'أدخل وصف التطبيق الخاص بك',
  config_endpoint: 'نقطة نهاية تكوين موفر الهوية المفتوحة',
  issuer_endpoint: 'نقطة نهاية المصدر',
  jwks_uri: 'عنوان URI لـ JWKS',
  authorization_endpoint: 'نقطة نهاية الترخيص',
  authorization_endpoint_tip:
    'نقطة النهاية لأداء المصادقة والترخيص. يُستخدم لـ OpenID Connect <a>المصادقة</a>.',
  show_endpoint_details: 'إظهار تفاصيل النقطة النهائية',
  hide_endpoint_details: 'إخفاء تفاصيل النقطة النهائية',
  logto_endpoint: 'نقطة نهاية Logto',
  application_id: 'معرف التطبيق',
  application_id_tip:
    'معرف التطبيق الفريد الذي يتم إنشاؤه عادةً بواسطة Logto. يُشير أيضًا إلى "client_id" في OpenID Connect.',
  application_secret: 'سر التطبيق',
  application_secret_other: 'أسرار التطبيق',
  redirect_uri: 'عنوان URI لإعادة التوجيه',
  redirect_uris: 'عناوين URI لإعادة التوجيه',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'عنوان URI الذي يتم إعادة التوجيه إليه بعد تسجيل المستخدم (سواء نجح أم فشل). انظر OpenID Connect <a>AuthRequest</a> لمزيد من المعلومات.',
  mixed_redirect_uri_warning:
    'نوع التطبيق الخاص بك غير متوافق مع واحد على الأقل من عناوين URI لإعادة التوجيه. لا يتبع أفضل الممارسات ونوصي بشدة بالحفاظ على الاتساق في عناوين URI لإعادة التوجيه.',
  post_sign_out_redirect_uri: 'عنوان URI لإعادة التوجيه بعد تسجيل الخروج',
  post_sign_out_redirect_uris: 'عناوين URI لإعادة التوجيه بعد تسجيل الخروج',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    'عنوان URI الذي يتم إعادة التوجيه إليه بعد تسجيل المستخدم الخروج (اختياري). قد لا يكون له تأثير عملي في بعض أنواع التطبيقات.',
  cors_allowed_origins: 'المصادر المسموح بها لـ CORS',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    'بشكل افتراضي ، سيتم السماح بجميع مصادر عناوين URI لإعادة التوجيه. عادةً ما لا يلزم اتخاذ أي إجراء لهذا الحقل. انظر <a>وثائق MDN</a> للحصول على معلومات مفصلة.',
  token_endpoint: 'نقطة نهاية الرمز',
  user_info_endpoint: 'نقطة نهاية معلومات المستخدم',
  enable_admin_access: 'تمكين الوصول الإداري',
  enable_admin_access_label:
    'تمكين أو تعطيل الوصول إلى واجهة برمجة التطبيقات للإدارة. بمجرد التمكين ، يمكنك استخدام رموز الوصول لاستدعاء واجهة برمجة التطبيقات للإدارة نيابة عن هذا التطبيق.',
  always_issue_refresh_token: 'إصدار رمز التحديث دائمًا',
  always_issue_refresh_token_label:
    'عند التمكين ، ستصدر Logto دائمًا رموز التحديث ، بغض النظر عما إذا تم تقديم "prompt=consent" في طلب المصادقة. ومع ذلك ، يُنصح بعدم استخدام هذه الممارسة إلا إذا كان ضروريًا ، حيث أنها غير متوافقة مع OpenID Connect وقد تسبب مشاكل بالإمكان.',
  refresh_token_ttl: 'مدة صلاحية رمز التحديث (TTL) بالأيام',
  refresh_token_ttl_tip:
    'المدة التي يمكن فيها استخدام رمز التحديث لطلب رموز وصول جديدة قبل أن ينتهي صلاحيته ويصبح غير صالح. ستمتد طلبات الرموز إلى هذه القيمة.',
  rotate_refresh_token: 'تدوير رمز التحديث',
  rotate_refresh_token_label:
    'عند التمكين ، سيصدر Logto رمز تحديث جديد لطلبات الرموز عند مرور 70٪ من وقت الحياة الأصلي (TTL) أو تلبية شروط معينة. <a>تعرف على المزيد</a>',
  rotate_refresh_token_label_for_public_clients:
    'عند التمكين ، سيصدر Logto رمز تحديث جديد لكل طلب رمز. <a>تعرف على المزيد</a>',
  backchannel_logout: 'تسجيل الخروج الخلفي',
  backchannel_logout_description:
    'قم بتكوين نقطة نهاية تسجيل الخروج الخلفية لـ OpenID Connect وما إذا كانت الجلسة مطلوبة لهذا التطبيق.',
  backchannel_logout_uri: 'عنوان URI لتسجيل الخروج الخلفي',
  backchannel_logout_uri_session_required: 'هل الجلسة مطلوبة؟',
  backchannel_logout_uri_session_required_description:
    'عند التمكين ، يتطلب RP تضمين مطالبة "sid" (معرف الجلسة) في رمز التسجيل الخروج لتحديد جلسة RP مع OP عند استخدام "backchannel_logout_uri".',
  delete_description:
    'لا يمكن التراجع عن هذا الإجراء. سيتم حذف التطبيق بشكل دائم. يرجى إدخال اسم التطبيق <span>{{name}}</span> للتأكيد.',
  enter_your_application_name: 'أدخل اسم التطبيق الخاص بك',
  application_deleted: 'تم حذف التطبيق {{name}} بنجاح',
  redirect_uri_required: 'يجب عليك إدخال عنوان URI لإعادة التوجيه واحد على الأقل',
  app_domain_description_1:
    'لا تتردد في استخدام نطاقك مع {{domain}} المدعومة بواسطة Logto ، والتي تكون صالحة بشكل دائم.',
  app_domain_description_2:
    'لا تتردد في استخدام نطاقك <domain>{{domain}}</domain> الذي يكون صالحًا بشكل دائم.',
  custom_rules: 'قواعد المصادقة المخصصة',
  custom_rules_placeholder: '^/(admin|privacy)/.+$',
  custom_rules_description:
    'قم بتعيين قواعد بتعابير منتظمة للمسارات التي تتطلب المصادقة. الافتراضي: حماية الموقع بأكمله إذا تركته فارغًا.',
  authentication_routes: 'مسارات المصادقة',
  custom_rules_tip:
    'فيما يلي سيناريوهان:<ol><li>لحماية المسارات "/admin" و "/privacy" فقط بالمصادقة: ^/(admin|privacy)/.*</li><li>للاستثناء من ملفات JPG من المصادقة: ^(?!.*\\.jpg$).*$</li></ol>',
  authentication_routes_description:
    'قم بتوجيه زر المصادقة الخاص بك باستخدام المسارات المحددة. ملاحظة: هذه المسارات لا يمكن استبدالها.',
  protect_origin_server: 'حماية خادم المصدر الخاص بك',
  protect_origin_server_description:
    'تأكد من حماية خادم المصدر الخاص بك من الوصول المباشر. راجع الدليل للحصول على <a>تعليمات مفصلة</a> أكثر.',
  third_party_settings_description:
    'دمج التطبيقات الخارجية مع Logto كموفر الهوية الخاص بك (IdP) باستخدام OIDC / OAuth 2.0، مع شاشة موافقة لترخيص المستخدم.',
  session_duration: 'مدة الجلسة (بالأيام)',
  try_it: 'جربها',
  no_organization_placeholder: 'لم يتم العثور على أي منظمة. <a>انتقل إلى المنظمات</a>',
  field_custom_data: 'بيانات مخصصة',
  field_custom_data_tip:
    'معلومات تطبيق مخصصة إضافية غير مدرجة في خصائص التطبيق المحددة مسبقًا ، مثل الإعدادات والتكوينات الخاصة بالأعمال.',
  custom_data_invalid: 'يجب أن تكون البيانات المخصصة كائن JSON صالح',
  branding: {
    name: 'العلامة التجارية',
    description: 'قم بتخصيص شعار التطبيق ولون العلامة التجارية لتجربة المستوى التطبيق.',
    description_third_party: 'قم بتخصيص اسم التطبيق وشعاره على شاشة الموافقة.',
    app_logo: 'شعار التطبيق',
    app_level_sie: 'تجربة تسجيل الدخول على مستوى التطبيق',
    app_level_sie_switch:
      'قم بتمكين تجربة تسجيل الدخول على مستوى التطبيق وإعداد العلامة التجارية الخاصة بالتطبيق. إذا تم تعطيلها ، سيتم استخدام تجربة تسجيل الدخول الشاملة.',
    more_info: 'مزيد من المعلومات',
    more_info_description: 'قدم للمستخدمين مزيد من التفاصيل حول التطبيق على شاشة الموافقة.',
    display_name: 'اسم العرض',
    application_logo: 'شعار التطبيق',
    application_logo_dark: 'شعار التطبيق (داكن)',
    brand_color: 'لون العلامة التجارية',
    brand_color_dark: 'لون العلامة التجارية (داكن)',
    terms_of_use_url: 'عنوان URL لشروط استخدام التطبيق',
    privacy_policy_url: 'عنوان URL لسياسة الخصوصية للتطبيق',
  },
  permissions: {
    name: 'الأذونات',
    description:
      'حدد الأذونات التي يحتاجها التطبيق الطرف الثالث للموافقة على الوصول إلى أنواع بيانات محددة.',
    user_permissions: 'بيانات المستخدم الشخصية',
    organization_permissions: 'وصول المنظمة',
    table_name: 'منح الأذونات',
    field_name: 'الأذن',
    field_description: 'معروضة على شاشة الموافقة',
    delete_text: 'إزالة الأذن',
    permission_delete_confirm:
      'سيؤدي هذا الإجراء إلى سحب الأذونات الممنوحة للتطبيق الطرف الثالث ، مما يمنعه من طلب موافقة المستخدم على أنواع بيانات محددة. هل أنت متأكد أنك تريد المتابعة؟',
    permissions_assignment_description:
      'حدد الأذونات التي يطلبها التطبيق الطرف الثالث للموافقة على الوصول إلى أنواع بيانات محددة.',
    user_profile: 'بيانات المستخدم',
    api_permissions: 'أذونات واجهة برمجة التطبيقات',
    organization: 'أذونات المنظمة',
    user_permissions_assignment_form_title: 'Add the user profile permissions',
    organization_permissions_assignment_form_title: 'Add the organization permissions',
    api_resource_permissions_assignment_form_title: 'Add the API resource permissions',
    user_data_permission_description_tips:
      'You can modify the description of the personal user data permissions via "Sign-in Experience > Content > Manage Language"',
    permission_description_tips:
      'When Logto is used as an Identity Provider (IdP) for authentication in third-party apps, and users are asked for authorization, this description appears on the consent screen.',
    user_title: 'User',
    user_description:
      'Select the permissions requested by the third-party app for accessing specific user data.',
    grant_user_level_permissions: 'Grant permissions of user data',
    organization_title: 'Organization',
    organization_description:
      'Select the permissions requested by the third-party app for accessing specific organization data.',
    grant_organization_level_permissions: 'Grant permissions of organization data',
    oidc_title: 'OIDC',
    oidc_description:
      'يتم تكوين أذونات OIDC الأساسية تلقائيًا لتطبيقك. هذه النطاقات ضرورية للمصادقة ولا يتم عرضها على شاشة موافقة المستخدم.',
    default_oidc_permissions: 'أذونات OIDC الافتراضية',
    permission_column: 'الإذن',
    guide_column: 'الدليل',
    openid_permission: 'openid',
    openid_permission_guide:
      "اختياري للوصول إلى موارد OAuth.\nمطلوب لمصادقة OIDC. يمنح الوصول إلى رمز مميز للهوية (ID token) ويسمح بالوصول إلى 'userinfo_endpoint'.",
    offline_access_permission: 'offline_access',
    offline_access_permission_guide:
      'اختياري. يسترجع رموز التحديث للوصول طويل الأمد أو للمهام في الخلفية.',
  },
  roles: {
    assign_button: 'Assign roles',
    delete_description:
      'This action will remove this role from this machine-to-machine app. The role itself will still exist, but it will no longer be associated with this machine-to-machine app.',
    deleted: '{{name}} was successfully removed from this user.',
    assign_title: 'Assign roles to {{name}}',
    assign_subtitle:
      'Machine-to-machine apps must have machine-to-machine type of roles to access related API resources.',
    assign_role_field: 'Assign roles',
    role_search_placeholder: 'Search by role name',
    added_text: '{{value, number}} added',
    assigned_app_count: '{{value, number}} applications',
    confirm_assign: 'Assign roles',
    role_assigned: 'Successfully assigned role(s)',
    search: 'Search by role name, description or ID',
    empty: 'No role available',
  },
  secrets: {
    value: 'Value',
    empty: 'التطبيق لا يحتوي على أي أسرار.',
    created_at: 'Created at',
    expires_at: 'Expires at',
    never: 'Never',
    create_new_secret: 'Create new secret',
    delete_confirmation:
      'This action cannot be undone. Are you sure you want to delete this secret?',
    deleted: 'تم حذف السر بنجاح.',
    activated: 'تم تفعيل السر بنجاح.',
    deactivated: 'تم تعطيل السر بنجاح.',
    legacy_secret: 'Legacy secret',
    expired: 'Expired',
    expired_tooltip: 'This secret was expired on {{date}}.',
    create_modal: {
      title: 'Create application secret',
      expiration: 'Expiration',
      expiration_description: 'The secret will expire at {{date}}.',
      expiration_description_never:
        'The secret will never expire. We recommend setting an expiration date for enhanced security.',
      days: '{{count}} day',
      days_other: '{{count}} days',
      years: '{{count}} عام',
      years_other: '{{count}} أعوام',
      created: 'تم إنشاء السر {{name}} بنجاح.',
    },
    edit_modal: {
      title: 'Edit application secret',
      edited: 'تم تعديل السر {{name}} بنجاح.',
    },
  },
  saml_idp_config: {
    title: 'بيانات تعريف SAML IdP',
    description: 'استخدم البيانات التعريفية والشهادة التالية لتكوين SAML IdP في تطبيقك.',
    metadata_url_label: 'URL لبيانات تعريف IdP',
    single_sign_on_service_url_label: 'URL لخدمة تسجيل الدخول الموحدة',
    idp_entity_id_label: 'معرف كيان IdP',
  },
  saml_idp_certificates: {
    title: 'شهادة توقيع SAML',
    expires_at: 'تنتهي في',
    finger_print: 'بصمة الأصابع',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
  },
  saml_idp_name_id_format: {
    title: 'تنسيق اسم المعرف',
    description: 'حدد تنسيق اسم المعرف لـ SAML IdP.',
    persistent: 'مستمر',
    persistent_description: 'استخدام معرف مستخدم Logto كاسم المعرف',
    transient: 'مؤقت',
    transient_description: 'استخدام معرف مستخدم مؤقت كاسم المعرف',
    unspecified: 'غير محدد',
    unspecified_description: 'استخدام معرف مستخدم Logto كاسم المعرف',
    email_address: 'البريد الإلكتروني',
    email_address_description: 'استخدام البريد الإلكتروني كاسم المعرف',
  },
  saml_encryption_config: {
    encrypt_assertion: 'تشفير تأكيد SAML',
    encrypt_assertion_description: 'بتفعيل هذا الخيار، سيتم تشفير تأكيد SAML.',
    encrypt_then_sign: 'تشفير ثم توقيع',
    encrypt_then_sign_description:
      'بتفعيل هذا الخيار، سيتم تشفير تأكيد SAML ثم توقيعه؛ بخلاف ذلك، سيتم توقيع تأكيد SAML ثم تشفيره.',
    certificate: 'شهادة',
    certificate_tooltip: 'انسخ والصق شهادة x509 التي تحصل عليها من مزود الخدمة لتشفير تأكيد SAML.',
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: 'الشهادة مطلوبة.',
    certificate_invalid_format_error:
      'تم اكتشاف تنسيق غير صالح للشهادة. يرجى التحقق من تنسيق الشهادة والمحاولة مرة أخرى.',
  },
  saml_app_attribute_mapping: {
    name: 'تعيينات السمات',
    title: 'تعيينات السمات الأساسية',
    description: 'أضف تعيينات السمات لمزامنة ملف تعريف المستخدم من Logto إلى تطبيقك.',
    col_logto_claims: 'قيمة Logto',
    col_sp_claims: 'اسم القيمة في تطبيقك',
    add_button: 'أضف آخر.',
  },
};

export default Object.freeze(application_details);
