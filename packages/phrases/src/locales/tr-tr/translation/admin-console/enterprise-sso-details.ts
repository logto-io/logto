const enterprise_sso_details = {
  back_to_sso_connectors: "Kurumsal SSO'ya geri dön",
  page_title: 'Kurumsal SSO bağlayıcı ayrıntıları',
  readme_drawer_title: 'Kurumsal SSO',
  readme_drawer_subtitle:
    "Son kullanıcı SSO'yu etkinleştirmek için kurumsal SSO bağlayıcılarını kurun",
  tab_experience: 'SSO Deneyimi',
  tab_connection: 'Bağlantı',
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
};

export default Object.freeze(enterprise_sso_details);
