const application_details = {
  page_title: 'Uygulama detayları',
  back_to_applications: 'Uygulamalara geri dön',
  check_guide: 'Kılavuza Göz At',
  settings: 'Ayarlar',
  settings_description:
    '"Uygulama", kullanıcı bilgilerine erişebilen veya bir kullanıcı adına işlem yapabilen kayıtlı yazılım ya da hizmettir. Uygulamalar, Logto\'nun kimin ne talep ettiğini anlamasına yardımcı olur ve oturum açma ile izin süreçlerini yönetir. Kimlik doğrulaması için gerekli alanları doldurun.',
  integration: 'Entegrasyon',
  integration_description:
    "Cloudflare'ın kenar ağı tarafından desteklenen ve dünya çapında en üst düzey performans ve 0ms soğuk başlangıçlarla Logto güvenli çalışanlarla dağıtım yapın.",
  service_configuration: 'Hizmet yapılandırması',
  service_configuration_description: 'Servisinizde gerekli yapılandırmaları tamamlayın.',
  session: 'Oturum',
  endpoints_and_credentials: 'Bitiş Noktaları ve Kimlik Bilgileri',
  endpoints_and_credentials_description:
    'Uygulamanızda OIDC bağlantısını kurmak için aşağıdaki bitiş noktalarını ve kimlik bilgilerini kullanın.',
  refresh_token_settings: 'Yenileme belirteci',
  refresh_token_settings_description: 'Bu uygulama için yenileme belirteci kurallarını yönetin.',
  machine_logs: 'Makine günlükleri',
  application_name: 'Uygulama Adı',
  application_name_placeholder: 'Uygulamam',
  description: 'Açıklama',
  description_placeholder: 'Uygulama açıklamasını giriniz',
  config_endpoint: 'OpenID Sağlayıcı yapılandırma bitiş noktası',
  issuer_endpoint: 'Yayımlayıcı bitiş noktası',
  jwks_uri: 'JWKS URI',
  authorization_endpoint: 'Yetkilendirme bitiş noktası',
  authorization_endpoint_tip:
    'Kimlik doğrulama ve yetkilendirme için bir bitiş noktası. OpenID Connect <a>Authentication</a> için kullanılır.',
  show_endpoint_details: 'Bitiş noktası ayrıntılarını göster',
  hide_endpoint_details: 'Bitiş noktası ayrıntılarını gizle',
  logto_endpoint: 'Logto bitiş noktası',
  application_id: 'Uygulama IDsi',
  application_id_tip:
    'Genellikle Logto tarafından oluşturulan benzersiz bir uygulama tanımlayıcısıdır. Ayrıca OpenID Connect "client_id" anlamına gelir.',
  application_secret: 'Uygulama Sırrı',
  application_secret_other: 'Uygulama sırları',
  redirect_uri: 'Yönlendirme URIı',
  redirect_uris: 'Yönlendirme URIları',
  redirect_uri_placeholder: 'https://siteniz.com/uygulama',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'Kullanıcının oturum açma işlemi tamamlandıktan sonra (başarılı olsa da olmasa da) yönlendirilen bir URI. Daha fazla bilgi için OpenID Connect <a>AuthRequesta</a> bakınız.',
  mixed_redirect_uri_warning:
    'Uygulama türünüz en az bir yönlendirme URIı ile uyumlu değil. Bu, en iyi uygulamaları takip etmez ve yönlendirme URIlarını tutarlı tutmanızı şiddetle öneriyoruz.',
  post_sign_out_redirect_uri: 'Oturumdan Çıkış sonrası yönlendirme URIı',
  post_sign_out_redirect_uris: 'Oturumdan Çıkış sonrası yönlendirme URIları',
  post_sign_out_redirect_uri_placeholder: 'https://siteniz.com/anasayfa',
  post_sign_out_redirect_uri_tip:
    'URI, Oturumdan Çıkış sonrası yönlendirme yapar (isteğe bağlıdır). Bazı uygulama türlerinde pratik bir etkisi olmayabilir.',
  cors_allowed_origins: 'CORS izinli originler',
  cors_allowed_origins_placeholder: 'https://siteniz.com',
  cors_allowed_origins_tip:
    'Varsayılan olarak, Yönlendirme URIlerinin tüm originlerine izin verilir. Genellikle bu alan için herhangi bir işlem gerekmez. Ayrıntılı bilgi için <a>MDN doc</a> sayfasına bakın.',
  token_endpoint: 'Belirteç bitiş noktası',
  user_info_endpoint: 'Kullanıcı bilgileri bitiş noktası',
  enable_admin_access: 'Yönetici erişimini etkinleştir',
  enable_admin_access_label:
    "Yönetim API erişimine izin verme veya engel. Etkinleştirildikten sonra, bu uygulama adına yönetim API'sini çağırmak için erişim belirteçleri kullanabilirsiniz.",
  always_issue_refresh_token: 'Her zaman Yenileme Belirteci ver',
  always_issue_refresh_token_label:
    "Bu yapılandırmayı etkinleştirmek, Logto'nun OpenID Connect ile uyumlu olmayan ve olası sorunlara neden olabilecek her zaman Yenileme Belirteği çıkarmasına izin verir `prompt=consent` kimlik doğrulama isteğinin sunulup sunulmadığına bakılmaksızın. Ancak, bu uygulama sadece gerekli olduğunda caydırılmayan bir uygulamadır.",
  refresh_token_ttl: 'Yenileme Belirteci süresi (gün cinsinden)',
  refresh_token_ttl_tip:
    'Yeni erişim belirteği talepleri için Yenileme Belirteği kullanılabilecek süre. Belirteğin süresi dolmadan önce yapılan talepler belirteğin ömrünü uzatacaktır.',
  rotate_refresh_token: 'Yenileme Belirteci değiştir',
  rotate_refresh_token_label:
    "Bu seçenek etkinleştirildiğinde, Logto Yenileme Belirteği Bitiş Süresinin %70'i geçildiğinde veya belirli koşullar sağlandığında yeni bir Yenileme Belirteği verecektir. <a>Daha fazlası için tıklayın</a>",
  rotate_refresh_token_label_for_public_clients:
    'Etkinleştirildiğinde, Logto her belirteç isteğinde yeni bir yenileme belirteci verecektir. <a>Daha fazlasını öğrenin</a>',
  backchannel_logout: 'Arka kanal oturumu kapatma',
  backchannel_logout_description:
    'OpenID Connect arka kanal oturumu kapatma bitiş noktasını yapılandırın ve bu uygulama için oturumun gerekli olup olmadığını ayarlayın.',
  backchannel_logout_uri: 'Arka kanal oturum kapatma URI',
  backchannel_logout_uri_session_required: 'Oturum gerekli mi?',
  backchannel_logout_uri_session_required_description:
    'Etkinleştirildiğinde, RP, `sid` (oturum IDsi) talebinin oturumu kapatma belirtecinde bulunmasını ve `backchannel_logout_uri` kullanıldığında RP oturumunu OP ile tanımlamak için dahil edilmesini isteyecektir.',
  delete_description:
    'Bu eylem geri alınamaz. Uygulama kalıcı olarak silinecektir. Lütfen onaylamak için uygulama adı <span>{{name}}</span> girin.',
  enter_your_application_name: 'Uygulama adı giriniz',
  application_deleted: '{{name}} Uygulaması başarıyla silindi',
  redirect_uri_required: 'En az 1 yönlendirme URIı girmelisiniz',
  app_domain_description_1:
    '{{domain}} destekli Logto ile alanınızı özgürce kullanın, bu sürekli geçerlidir.',
  app_domain_description_2:
    'Kalıcı olarak geçerli olan <domain>{{domain}}</domain> alanınızı özgürce kullanabilirsiniz.',
  custom_rules: 'Özel kimlik doğrulama kuralları',
  custom_rules_placeholder: '^/(admin|privacy)/.+',
  custom_rules_description:
    'Kimlik doğrulaması gerektiren rotalar için düzenli ifadelerle kurallar belirleyin. Varsayılan: boş bırakılırsa tüm site koruması.',
  authentication_routes: 'Kimlik doğrulama rotaları',
  custom_rules_tip:
    "İki durum senaryosu burada:<ol><li>Sadece '/admin' ve '/privacy' rotalarını kimlik doğrulama ile korumak için: ^/(admin|privacy)/.*</li><li>JPG resimlerini kimlik doğrulamadan hariç tutmak için: ^(?!.*\\.jpg$).*$</li></ol>",
  authentication_routes_description:
    'Belirtilen rotaları kullanarak kimlik doğrulama düğmenizi yönlendirin. Not: Bu rotalar değiştirilemez.',
  protect_origin_server: 'Orjın sunucunu koru',
  protect_origin_server_description:
    'Orjın sunucunuzu doğrudan erişimden korumaya emin olun. Daha fazla <a>açıklamalı talimatlar</a> için kılavuza bakın.',
  third_party_settings_description:
    "Logto'yu Kimlik Sağlayıcı (IdP) olarak kullanarak üçüncü taraf uygulamaları OIDC / OAuth 2.0 ile entegre edin ve kullanıcı yetkilendirmesi için bir izin ekranı özelliği bulunmaktadır.",
  session_duration: 'Oturum süresi (gün cinsinden)',
  try_it: 'Deneyin',
  no_organization_placeholder: 'Organizasyon bulunamadı. <a>Organizasyonlara git</a>',
  field_custom_data: 'Özel veri',
  field_custom_data_tip:
    'Önceden tanımlanmış uygulama özelliklerinde listelenmeyen ek özel uygulama bilgileri, iş ile ilgili ayarlar ve yapılandırmalar gibi.',
  custom_data_invalid: 'Özel veri geçerli bir JSON nesnesi olmalıdır',
  branding: {
    name: 'Markalama',
    description: 'Uygulamanızın adını ve logosunu açıklama ekranında özelleştirin.',
    description_third_party: 'Uygulamanızın adını ve logosunu onay ekranında özelleştirin.',
    app_logo: 'Uygulama logosu',
    app_level_sie: 'Uygulama düzeyinde oturum açma deneyimi',
    app_level_sie_switch:
      'Uygulama düzeyinde oturum açma deneyimini etkinleştirin ve uygulamaya özel markalama ayarlayın. Devre dışı bırakılırsa, genel oturum açma deneyimi kullanılacaktır.',
    more_info: 'Daha fazla bilgi',
    more_info_description:
      'Uygulamanız hakkında kullanıcılara açıklama ekranında daha fazla bilgi sunun.',
    display_name: 'Adı göster',
    application_logo: 'Uygulama logosu',
    application_logo_dark: 'Uygulama logosu (koyu)',
    brand_color: 'Marka rengi',
    brand_color_dark: 'Marka rengi (koyu)',
    terms_of_use_url: 'Kullanım Koşulları URLsi',
    privacy_policy_url: 'Gizlilik Politikası URLsi',
  },
  permissions: {
    name: 'İzinler',
    description:
      'Üçüncü taraf uygulamanın belirli veri türlerine erişim için kullanıcı yetkilendirmesi için gereken izinleri seçin.',
    user_permissions: 'Kişisel kullanıcı verileri',
    organization_permissions: 'Organizasyon erişimi',
    table_name: 'İzin ver',
    field_name: 'İzin',
    field_description: 'Açıklama ekranında gösterilir',
    delete_text: 'İzni kaldır',
    permission_delete_confirm:
      'Bu işlem, üçüncü taraf uygulamaya verilen izinleri geri çekecek ve belirli veri tipleri için kullanıcı yetkilendirmesi istemesini engelleyecektir. Devam etmek istediğinizden emin misiniz?',
    permissions_assignment_description:
      'Üçüncü taraf uygulamanın belirli veri türlerine erişim için kullanıcı yetkilendirme istediği izinleri seçin.',
    user_profile: 'Kullanıcı verileri',
    api_permissions: 'API izinleri',
    organization: 'Organizasyon izinleri',
    user_permissions_assignment_form_title: 'Kullanıcı profili izinlerini ekleyin',
    organization_permissions_assignment_form_title: 'Organizasyon izinlerini ekleyin',
    api_resource_permissions_assignment_form_title: 'API kaynağı izinlerini ekleyin',
    user_data_permission_description_tips:
      'Kişisel kullanıcı veri izinlerinin açıklamasını "Oturum Açma Deneyimi > İçerik > Dil Yönetimi" aracılığıyla değiştirebilirsiniz.',
    permission_description_tips:
      'Logto, üçüncü taraf uygulamalar için kimlik sağlayıcı (IdP) olarak kullanıldığında ve kullanıcılardan yetkilendirme istendiğinde, bu açıklama açıklama ekranında görünür.',
    user_title: 'Kullanıcı',
    user_description:
      'Üçüncü taraf uygulamanın belirli kullanıcı verilerine erişmek için istediği izinleri seçin.',
    grant_user_level_permissions: 'Kullanıcı veri izinlerini ver',
    organization_title: 'Organizasyon',
    organization_description:
      'Üçüncü taraf uygulamanın belirli organizasyon verilerine erişmek için istediği izinleri seçin.',
    grant_organization_level_permissions: 'Organizasyon veri izinlerini ver',
    oidc_title: 'OIDC',
    oidc_description:
      'Temel OIDC izinleri uygulamanız için otomatik olarak yapılandırılır. Bu kapsamlar kimlik doğrulama için gereklidir ve kullanıcı onay ekranında gösterilmez.',
    default_oidc_permissions: 'Varsayılan OIDC izinleri',
    permission_column: 'İzin',
    guide_column: 'Kılavuz',
    openid_permission: 'openid',
    openid_permission_guide:
      "OAuth kaynak erişimi için isteğe bağlıdır.\nOIDC kimlik doğrulaması için gereklidir. Bir ID token'a erişim sağlar ve 'userinfo_endpoint'e erişime izin verir.",
    offline_access_permission: 'offline_access',
    offline_access_permission_guide:
      'İsteğe bağlıdır. Uzun süreli erişim veya arka plan görevleri için yenileme belirteçleri (refresh token) alır.',
  },
  roles: {
    assign_button: 'Makineden makineye rolleri atayın',
    delete_description:
      'Bu işlem bu rolü bu makine günlüğünden kaldıracaktır. Rol kendisi hala var olacak, ancak artık makine-makine uygulamasıyla ilişkilendirilmeyecektir.',
    deleted: '{{name}}, bu kullanıcıdan başarıyla kaldırıldı.',
    assign_title: '{{name}} için makineden makineye rolleri atayın',
    assign_subtitle:
      'Makine-makine uygulamalarının ilgili API kaynaklarına erişmek için makine-makine türünde rolleri olması gerekir.',
    assign_role_field: 'Makineden makineye rolleri atayın',
    role_search_placeholder: 'Rol adıyla arama yapın',
    added_text: '{{value, number}} eklendi',
    assigned_app_count: '{{value, number}} uygulamalar',
    confirm_assign: 'Makineden makineye rolleri atayın',
    role_assigned: 'Başarıyla rol(ler) atandı',
    search: "Rol adı, açıklaması veya ID'si ile arama yapın",
    empty: 'Mevcut rol yok',
  },
  secrets: {
    value: 'Değer',
    empty: 'Uygulamanın herhangi bir sırrı yok.',
    created_at: 'Oluşturulma tarihi',
    expires_at: 'Son kullanma tarihi',
    never: 'Asla',
    create_new_secret: 'Yeni sır oluştur',
    delete_confirmation: 'Bu işlem geri alınamaz. Bu sırrı silmek istediğinizden emin misiniz?',
    deleted: 'Sır başarıyla silindi.',
    activated: 'Sır başarıyla etkinleştirildi.',
    deactivated: 'Sır başarıyla devre dışı bırakıldı.',
    legacy_secret: 'Eski sır',
    expired: 'Süresi doldu',
    expired_tooltip: 'Bu sır {{date}} tarihinde süresi dolmuştu.',
    create_modal: {
      title: 'Uygulama sırrı oluştur',
      expiration: 'Son kullanma tarihi',
      expiration_description: 'Sır {{date}} tarihinde süresi dolacak.',
      expiration_description_never:
        'Sırın süresi asla dolmaz. Gelişmiş güvenlik için bir son kullanma tarihi ayarlamanızı öneririz.',
      days: '{{count}} gün',
      days_other: '{{count}} gün',
      years: '{{count}} yıl',
      years_other: '{{count}} yıl',
      created: 'Sır {{name}} başarıyla oluşturuldu.',
    },
    edit_modal: {
      title: 'Uygulama sırrını düzenle',
      edited: 'Sır {{name}} başarıyla düzenlendi.',
    },
  },
  saml_idp_config: {
    title: 'SAML IdP metadata',
    description:
      'Aşağıdaki meta verileri ve sertifikayı kullanarak uygulamanızda SAML IdPyi yapılandırın.',
    metadata_url_label: 'IdP metadata URL',
    single_sign_on_service_url_label: 'Tek oturum açma hizmet URLsi',
    idp_entity_id_label: 'IdP varlık IDsi',
  },
  saml_idp_certificates: {
    title: 'SAML imzalama sertifikası',
    expires_at: 'Bitiş tarihi',
    finger_print: 'Parmak izi',
    status: 'Durum',
    active: 'Aktif',
    inactive: 'Pasif',
  },
  saml_idp_name_id_format: {
    title: 'Ad ID formatı',
    description: 'SAML IdPnin ad ID formatını seçin.',
    persistent: 'Kalıcı',
    persistent_description: 'Logto kullanıcı kimliğini Ad ID olarak kullan',
    transient: 'Geçici',
    transient_description: 'Tek kullanımlık kullanıcı kimliğini Ad ID olarak kullan',
    unspecified: 'Belirtilmemiş',
    unspecified_description: 'Logto kullanıcı kimliğini Ad ID olarak kullan',
    email_address: 'E-posta adresi',
    email_address_description: 'E-posta adresini Ad ID olarak kullan',
  },
  saml_encryption_config: {
    encrypt_assertion: 'SAML beyanını şifrele',
    encrypt_assertion_description: 'Bu seçeneği etkinleştirerek SAML beyanı şifrelenir.',
    encrypt_then_sign: 'Şifrele ve sonra imzala',
    encrypt_then_sign_description:
      'Bu seçeneği etkinleştirerek SAML beyanı şifrelenir ve sonra imzalanır; aksi takdirde SAML beyanı imzalanır ve ardından şifrelenir.',
    certificate: 'Sertifika',
    certificate_tooltip:
      'SAML beyanını şifrelemek için hizmet sağlayıcınızdan aldığınız x509 sertifikasını kopyalayıp yapıştırın.',
    certificate_placeholder:
      '-----BEGIN CERTIFICATE-----\nMIICYDCCAcmgAwIBA...\n-----END CERTIFICATE-----\n',
    certificate_missing_error: 'Sertifika gereklidir.',
    certificate_invalid_format_error:
      'Geçersiz sertifika formatı tespit edildi. Lütfen sertifika formatını kontrol edin ve tekrar deneyin.',
  },
  saml_app_attribute_mapping: {
    name: 'Özellik eşlemeleri',
    title: 'Temel özellik eşlemeleri',
    description:
      'Logto kullanıcı profilini uygulamanıza senkronize etmek için özellik eşlemeleri ekleyin.',
    col_logto_claims: 'Logto değeri',
    col_sp_claims: 'Uygulamanızın değer adı',
    add_button: 'Başka bir eklenti',
  },
};

export default Object.freeze(application_details);
