const enterprise_sso_details = {
  back_to_sso_connectors: "Kurumsal SSO'ya geri dön",
  page_title: 'Kurumsal SSO bağlayıcı ayrıntıları',
  readme_drawer_title: 'Kurumsal SSO',
  readme_drawer_subtitle:
    "Son kullanıcıların SSO'yu etkinleştirmek için kurumsal SSO bağlayıcılarını yapılandırın",
  tab_settings: 'Ayarlar',
  tab_connection: 'Bağlantı',
  general_settings_title: 'Genel Ayarlar',
  custom_branding_title: 'Özel Markalama',
  custom_branding_description:
    'Oturum açma düğmesi ve diğer senaryolar için kurumsal IdP görüntü bilgilerini özelleştirin.',
  email_domain_field_name: 'Kurumsal e-posta etki alanı',
  email_domain_field_description:
    "Bu e-posta etki alanına sahip kullanıcılar SSO'yu kimlik doğrulaması için kullanabilir. Lütfen etki alanının kuruluşa ait olduğundan emin olun.",
  email_domain_field_placeholder: 'E-posta etki alanı',
  sync_profile_field_name: 'Kimlik sağlayıcıdan profil bilgisi senkronize et',
  sync_profile_option: {
    register_only: 'Yalnızca ilk oturum açmada senkronize et',
    each_sign_in: 'Her oturum açmada her zaman senkronize et',
  },
  connector_name_field_name: 'Bağlayıcı adı',
  connector_logo_field_name: 'Bağlayıcı logosu',
  branding_logo_context: 'Logo yükle',
  branding_logo_error: 'Logo yükleme hatası: {{error}}',
  branding_logo_field_name: 'Logo',
  branding_logo_field_placeholder: 'https://your.domain/logo.png',
  branding_dark_logo_context: 'Koyu mod logosu yükle',
  branding_dark_logo_error: 'Koyu mod logosu yükleme hatası: {{error}}',
  branding_dark_logo_field_name: 'Logo (koyu mod)',
  branding_dark_logo_field_placeholder: 'https://your.domain/dark-mode-logo.png',
  check_readme: "README'yi kontrol et",
  enterprise_sso_deleted: 'Kurumsal SSO bağlayıcısı başarıyla silindi',
  delete_confirm_modal_title: 'Kurumsal SSO bağlayıcısını sil',
  delete_confirm_modal_content:
    "Bu kurumsal bağlayıcıyı silmek istediğinizden emin misiniz? Kimlik sağlayıcılardan gelen kullanıcılar Tek Oturum Açma'yı kullanmayacak.",
  upload_idp_metadata_title: 'IdP meta verisi yükle',
  upload_idp_metadata_description: 'Kimlik sağlayıcıdan kopyalanan meta veriyi yapılandırın.',
  upload_saml_idp_metadata_info_text_url:
    "Kimlik sağlayıcıdan meta veri URL'sini yapıştırarak bağlanın.",
  upload_saml_idp_metadata_info_text_xml: 'Kimlik sağlayıcıdan meta veriyi yapıştırarak bağlanın.',
  upload_saml_idp_metadata_info_text_manual: 'Kimlik sağlayıcıdan meta veriyi doldurarak bağlanın.',
  upload_oidc_idp_info_text: 'Bağlanmak için kimlik sağlayıcıdan bilgiyi doldurun.',
  service_provider_property_title: "Hizmetinizi IdP'de yapılandırın",
  service_provider_property_description:
    "{{protocol}} ile kendi {{name}}'nızın uygulama entegrasyonunu oluşturun. Ardından aşağıdaki Servis Sağlayıcı ayrıntılarını yapılandırmak için {{protocol}}'ü nasıl yapacağınızı yapıştırın.",
  attribute_mapping_title: 'Öznitelik eşleme',
  attribute_mapping_description:
    "Kullanıcının `id` ve `e-posta`sının IdP'den kullanıcı profili senkronizasyonu için gerekli olduğu. Aşağıdaki adı ve değeri {{name}} içine girin.",
  saml_preview: {
    sign_on_url: "Oturum açma URL'si",
    entity_id: 'Veren',
    x509_certificate: 'İmza sertifikası',
  },
  oidc_preview: {
    authorization_endpoint: 'Yetkilendirme noktası',
    token_endpoint: 'Belirteç noktası',
    userinfo_endpoint: 'Kullanıcı bilgi noktası',
    jwks_uri: 'JSON web anahtarı seti noktası',
    issuer: 'Veren',
  },
};

export default Object.freeze(enterprise_sso_details);
