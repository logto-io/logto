const enterprise_sso_details = {
  back_to_sso_connectors: 'العودة إلى SSO للشركات',
  page_title: 'تفاصيل موصّل SSO للشركات',
  readme_drawer_title: 'SSO للشركات',
  readme_drawer_subtitle:
    'قم بإعداد موصّلات SSO للشركات لتمكين تسجيل الدخول الموحد للمستخدمين النهائيين',
  tab_experience: 'تجربة SSO',
  tab_connection: 'الاتصال',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
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
  idp_initiated_auth_config: {
    /** UNTRANSLATED */
    card_title: 'IdP-initiated SSO',
    /** UNTRANSLATED */
    card_description:
      'User typically start the authentication process from your app using the SP-initiated SSO flow. DO NOT enable this feature unless absolutely necessary.',
    /** UNTRANSLATED */
    enable_idp_initiated_sso: 'Enable IdP-initiated SSO',
    /** UNTRANSLATED */
    enable_idp_initiated_sso_description:
      "Allow enterprise users to start the authentication process directly from the identity provider's portal. Please understand the potential security risks before enabling this feature.",
    /** UNTRANSLATED */
    default_application: 'Default application',
    /** UNTRANSLATED */
    default_application_tooltip:
      'Target application the user will be redirected to after authentication.',
    /** UNTRANSLATED */
    empty_applications_error:
      'No applications found. Please add one in the <a>Applications</a> section.',
    /** UNTRANSLATED */
    empty_applications_placeholder: 'No applications',
    /** UNTRANSLATED */
    authentication_type: 'Authentication type',
    /** UNTRANSLATED */
    auto_authentication_disabled_title: 'Redirect to client for SP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_disabled_description:
      'Recommended. Redirect users to the client-side application to initiate a secure SP-initiated OIDC authentication.  This will prevent the CSRF attacks.',
    /** UNTRANSLATED */
    auto_authentication_enabled_title: 'Directly sign in using the IdP-initiated SSO',
    /** UNTRANSLATED */
    auto_authentication_enabled_description:
      'After successful sign-in, users will be redirected to the specified Redirect URI with the authorization code (Without state and PKCE validation).',
    /** UNTRANSLATED */
    auto_authentication_disabled_app: 'For traditional web app, single-page app (SPA)',
    /** UNTRANSLATED */
    auto_authentication_enabled_app: 'For traditional web app',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri: 'Client callback URI',
    /** UNTRANSLATED */
    idp_initiated_auth_callback_uri_tooltip:
      'The client callback URI to initiate a SP-initiated SSO authentication flow. An ssoConnectorId will be appended to the URI as a query parameter. (e.g., https://your.domain/sso/callback?connectorId={{ssoConnectorId}})',
    /** UNTRANSLATED */
    redirect_uri: 'Post sign-in redirect URI',
    /** UNTRANSLATED */
    redirect_uri_tooltip:
      'The redirect URI to redirect users after successful sign-in. Logto will use this URI as the OIDC redirect URI in the authorization request. Use a dedicated URI for the IdP-initiated SSO authentication flow for better security.',
    /** UNTRANSLATED */
    empty_redirect_uris_error:
      'No redirect URI has been registered for the application. Please add one first.',
    /** UNTRANSLATED */
    redirect_uri_placeholder: 'Select a post sign-in redirect URI',
    /** UNTRANSLATED */
    auth_params: 'Additional authentication parameters',
    /** UNTRANSLATED */
    auth_params_tooltip:
      'Additional parameters to be passed in the authorization request. By default only (openid profile) scopes will be requested, you can specify additional scopes or a exclusive state value here. (e.g., { "scope": "organizations email", "state": "secret_state" }).',
  },
  /** UNTRANSLATED */
  trust_unverified_email: 'Trust unverified email',
  /** UNTRANSLATED */
  trust_unverified_email_label:
    'Always trust the unverified email addresses returned from the identity provider',
  /** UNTRANSLATED */
  trust_unverified_email_tip:
    'The Entra ID (OIDC) connector does not return the `email_verified` claim, meaning that email addresses from Azure are not guaranteed to be verified. By default, Logto will not sync unverified email addresses to the user profile. Enable this option only if you trust all the email addresses from the Entra ID directory.',
};

export default Object.freeze(enterprise_sso_details);
