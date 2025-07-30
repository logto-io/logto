const enterprise_sso_details = {
  back_to_sso_connectors: "Kurumsal SSO'ya geri dön",
  page_title: 'Kurumsal SSO bağlayıcı ayrıntıları',
  readme_drawer_title: 'Kurumsal SSO',
  readme_drawer_subtitle:
    "Son kullanıcı SSO'yu etkinleştirmek için kurumsal SSO bağlayıcılarını kurun",
  tab_experience: 'SSO Deneyimi',
  tab_connection: 'Bağlantı',
  tab_idp_initiated_auth: 'IdP başlatmalı SSO',
  general_settings_title: 'Genel',
  general_settings_description:
    'Son kullanıcı deneyimini yapılandırın ve SP başlatmalı SSO akışı için kurumsal e-posta etki alanını bağlayın.',
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
    card_title: 'IdP başlatmalı SSO',
    card_description:
      'Kullanıcılar genellikle SP başlatmalı SSO akışı kullanarak uygulamanızdan kimlik doğrulama sürecine başlar. Bu özelliği yalnızca kesinlikle gerekli olduğunda etkinleştirin.',
    enable_idp_initiated_sso: "IdP başlatmalı SSO'yu etkinleştir",
    enable_idp_initiated_sso_description:
      'Kurumsal kullanıcıların kimlik sağlayıcı portalından kimlik doğrulama sürecine doğrudan başlamalarına izin verin. Bu özelliği etkinleştirmeden önce olası güvenlik risklerini anlayın.',
    default_application: 'Varsayılan uygulama',
    default_application_tooltip:
      'Kullanıcının kimlik doğrulama sonrası yönlendirileceği hedef uygulama.',
    empty_applications_error:
      '<a>Uygulamalar</a> bölümünde hiçbir uygulama bulunamadı. Lütfen bir tane ekleyin.',
    empty_applications_placeholder: 'Uygulama yok',
    authentication_type: 'Kimlik doğrulama türü',
    auto_authentication_disabled_title: 'SP başlatmalı SSO için istemciye yönlendir',
    auto_authentication_disabled_description:
      'Önerilir. CSRF saldırılarını önlemek için kullanıcıları SP başlatmalı OIDC kimlik doğrulamasını başlatmak üzere istemci tarafı uygulamaya yönlendirin.',
    auto_authentication_enabled_title: 'IdP başlatmalı SSO kullanarak doğrudan oturum açın',
    auto_authentication_enabled_description:
      "Başarılı bir oturum açmanın ardından, kullanıcılar belirtilen Yönlendirme URI'sine yetkilendirme kodu ile yönlendirilecektir (Durum ve PKCE doğrulaması olmadan).",
    auto_authentication_disabled_app:
      'Geleneksel web uygulamaları, tek sayfa uygulamaları (SPA) için',
    auto_authentication_enabled_app: 'Geleneksel web uygulamaları için',
    idp_initiated_auth_callback_uri: "İstemci geri çağırma URI'si",
    idp_initiated_auth_callback_uri_tooltip:
      "SP başlatmalı SSO kimlik doğrulama akışını başlatmak için istemci geri çağırma URI'si. Bir ssoConnectorId sorgu parametresi olarak URI'ye eklenecektir. (Örneğin, https://your.domain/sso/callback?connectorId={{ssoConnectorId}})",
    redirect_uri: "Oturum sonrası yönlendirme URI'si",
    redirect_uri_tooltip:
      "Başarılı oturum açmadan sonra kullanıcıları yönlendirmek için kullanılacak yönlendirme URI'si. Logto, bu URI'yi yetkilendirme isteğinde OIDC yönlendirme URI'si olarak kullanacaktır. Daha iyi güvenlik için IdP başlatmalı SSO kimlik doğrulama akışı için özel bir URI kullanın.",
    empty_redirect_uris_error:
      "Uygulama için kayıtlı hiçbir yönlendirme URI'si bulunamadı. Lütfen önce bir tane ekleyin.",
    redirect_uri_placeholder: "Oturum sonrası yönlendirme URI'sini seçin",
    auth_params: 'Ek kimlik doğrulama parametreleri',
    auth_params_tooltip:
      'Yetkilendirme isteğine eklenmesi gereken ek parametreler. Varsayılan olarak yalnızca (openid profile) kapsamları istenecek olup, burada ek kapsamlar veya özel bir durum değeri belirtebilirsiniz. (Örneğin, { "scope": "organizations email", "state": "secret_state" }).',
  },
  trust_unverified_email: 'Doğrulanmamış e-postaya güven',
  trust_unverified_email_label:
    'Kimlik sağlayıcıdan dönen doğrulanmamış e-posta adreslerine her zaman güven',
  trust_unverified_email_tip:
    "Entra ID (OIDC) bağlayıcısı `email_verified` bilgisini döndürmez, bu da Azure'dan alınan e-posta adreslerinin doğrulandığının garanti edilmediği anlamına gelir. Varsayılan olarak, Logto doğrulanmamış e-posta adreslerini kullanıcı profiline senkronize etmeyecektir. Bu seçeneği yalnızca Entra ID dizininden gelen tüm e-posta adreslerine güveniyorsanız etkinleştirin.",
  offline_access: {
    label: 'Erişim belirtecini yenile',
    description:
      'Uygulamanızın kullanıcı yeniden yetkilendirmesi olmadan erişim belirtecini yenilemesine izin veren bir yenileme belirteci istemek için Google `çevrimdışı` erişimini etkinleştirin.',
  },
};

export default Object.freeze(enterprise_sso_details);
