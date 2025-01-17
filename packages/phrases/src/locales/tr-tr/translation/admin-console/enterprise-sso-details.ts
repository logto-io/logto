const enterprise_sso_details = {
  back_to_sso_connectors: "Kurumsal SSO'ya geri dön",
  page_title: 'Kurumsal SSO bağlayıcı ayrıntıları',
  readme_drawer_title: 'Kurumsal SSO',
  readme_drawer_subtitle:
    "Son kullanıcı SSO'yu etkinleştirmek için kurumsal SSO bağlayıcılarını kurun",
  tab_experience: 'SSO Deneyimi',
  tab_connection: 'Bağlantı',
  /** UNTRANSLATED */
  tab_idp_initiated_auth: 'IdP-initiated SSO',
  general_settings_title: 'Genel',
  custom_branding_title: 'Ekran',
  custom_branding_description:
    'Son kullanıcıların Tek Oturum Açma akışında gösterilen adı ve logoyu özelleştirin. Boş olduğunda varsayılanlar kullanılır.',
  email_domain_field_name: 'Kurumsal e-posta etki alanı',
  email_domain_field_description:
    "Bu e-posta etki alanına sahip kullanıcılar SSO'yu kimlik doğrulamak için kullanabilir. Lütfen etki alanının kurumunuza ait olduğunu doğrulayın.",
  email_domain_field_placeholder: 'E-posta etki alanı',
  sync_profile_field_name: 'Profil bilgilerini kimlik sağlayıcıdan senkronize et',
  sync_profile_option: {
    register_only: 'Yalnızca ilk oturum açmada senkronize et',
    each_sign_in: 'Her oturum açmada her zaman senkronize et',
  },
  connector_name_field_name: 'Bağlayıcı adı',
  display_name_field_name: 'Görüntüleme adı',
  connector_logo_field_name: 'Görüntüleme logosu',
  connector_logo_field_description:
    "Her resim 500KB'ın altında olmalıdır, yalnızca SVG, PNG, JPG, JPEG kullanılabilir.",
  branding_logo_context: 'Logo yükle',
  branding_logo_error: 'Logo yükleme hatası: {{error}}',
  branding_light_logo_context: 'Açık mod logo yükle',
  branding_light_logo_error: 'Açık mod logo yükleme hatası: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://sizin.domain/logo.png',
  branding_dark_logo_context: 'Koyu mod logo yükle',
  branding_dark_logo_error: 'Koyu mod logo yükleme hatası: {{error}}',
  branding_dark_logo_field_name: 'Logo (koyu mod)',
  branding_dark_logo_field_placeholder: 'https://sizin.domain/koyu-mod-logo.png',
  check_connection_guide: 'Bağlantı rehberi',
  enterprise_sso_deleted: 'Kurumsal SSO bağlayıcısı başarıyla silindi',
  delete_confirm_modal_title: 'Kurumsal SSO bağlayıcısını sil',
  delete_confirm_modal_content:
    "Bu kurumsal bağlayıcıyı silmek istediğinizden emin misiniz? Kimlik sağlayıcılardan gelen kullanıcılar Tek Oturum Açma'yı kullanmayacaklar.",
  upload_idp_metadata_title_saml: "Metadata'yü yükle",
  upload_idp_metadata_description_saml: 'Kimlik sağlayıcıdan kopyalanan metadatayı yapılandırın.',
  upload_idp_metadata_title_oidc: 'Kimlik sağlayıcıdan kimlik bilgilerini yükle',
  upload_idp_metadata_description_oidc:
    'Kimlik sağlayıcıdan kopyalanan kimlik bilgileri ve OIDC belirteç bilgilerini yapılandırın.',
  upload_idp_metadata_button_text: 'Metadatayı XML dosyası olarak yükle',
  upload_signing_certificate_button_text: 'Imza sertifikası dosyası yükle',
  configure_domain_field_info_text:
    'Kurumsal kullanıcıları Tek Oturum Açma için kimlik sağlayıcılarına yönlendirmek için e-posta etki alanı ekleyin.',
  email_domain_field_required: "Kurumsal SSO'yu etkinleştirmek için e-posta etki alanı gereklidir.",
  upload_saml_idp_metadata_info_text_url:
    "Kimlik sağlayıcıdan gelen metin URL'sini yapıştırarak bağlanın.",
  upload_saml_idp_metadata_info_text_xml:
    'Kimlik sağlayıcıdan gelen metin bilgilerini yapıştırarak bağlanın.',
  upload_saml_idp_metadata_info_text_manual:
    'Kimlik sağlayıcıdan gelen metin bilgilerini doldurarak bağlanın.',
  upload_oidc_idp_info_text: 'Kimlik sağlayıcıdan gelen bilgileri doldurarak bağlanın.',
  service_provider_property_title: "IdP'de yapılandırın",
  service_provider_property_description:
    'Kimlik sağlayıcınızda {{protocol}} kullanarak bir uygulama entegrasyonu kurun. Logto tarafından sağlanan ayrıntıları girin.',
  attribute_mapping_title: 'Özellik eşlemeleri',
  attribute_mapping_description:
    'Kimlik sağlayıcıdan kullanıcı profillerini kullanıcı özelliği eşlemesini yapılandırarak Logto tarafına senkronize edin.',
  saml_preview: {
    sign_on_url: "Oturum açma URL'si",
    entity_id: 'Deyici',
    x509_certificate: 'Imza sertifikası',
    certificate_content: 'Sonlanma {{date}}',
  },
  oidc_preview: {
    authorization_endpoint: 'Yetkilendirme son noktası',
    token_endpoint: 'Belirteç son noktası',
    userinfo_endpoint: 'Kullanıcı bilgisi son noktası',
    jwks_uri: 'JSON web anahtarı kümesi son noktası',
    issuer: 'Deyici',
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
