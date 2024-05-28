const application_details = {
  page_title: 'Uygulama detayları',
  back_to_applications: 'Uygulamalara geri dön',
  check_guide: 'Kılavuza Göz At',
  settings: 'Ayarlar',
  settings_description:
    'Bir "Uygulama", kullanıcı bilgilerine erişebilen veya bir kullanıcı adına hareket edebilen kayıtlı bir yazılım veya hizmettir. Uygulamalar, Kimin Logto\'dan ne istediğini tanımaya yardımcı olur ve giriş yapma ve izinleri işlemek için yardımcı olur. Kimlik doğrulaması için gerekli alanları doldurun.',
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
  application_roles: 'Roller',
  machine_logs: 'Makine günlükleri',
  application_name: 'Uygulama Adı',
  application_name_placeholder: 'Uygulamam',
  description: 'Açıklama',
  description_placeholder: 'Uygulama açıklamasını giriniz',
  config_endpoint: 'OpenID Sağlayıcı yapılandırma bitiş noktası',
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
  redirect_uri: 'Yönlendirme URIı',
  redirect_uris: 'Yönlendirme URIları',
  redirect_uri_placeholder: 'https://siteniz.com/uygulama',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'Kullanıcının oturum açma işlemi tamamlandıktan sonra (başarılı olsa da olmasa da) yönlendirilen bir URI. Daha fazla bilgi için OpenID Connect <a>AuthRequesta</a> bakınız.',
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
    'Belirtilen rotaları kullanarak kimlik doğrulama düğmesinizi yönlendirin. Not: Bu rotalar değiştirilemez.',
  protect_origin_server: 'Orjın sunucunu koru',
  protect_origin_server_description:
    'Orjın sunucunuzu doğrudan erişimden korumaya emin olun. Daha fazla <a>açıklamalı talimatlar</a> için kılavuza bakın.',
  session_duration: 'Oturum süresi (gün cinsinden)',
  try_it: 'Deneyin',
  branding: {
    name: 'Markalama',
    description: 'Uygulamanızın adını ve logosunu açıklama ekranında özelleştirin.',
    more_info: 'Daha fazla bilgi',
    more_info_description:
      'Uygulamanız hakkında kullanıcılara açıklama ekranında daha fazla bilgi sunun.',
    display_name: 'Adı göster',
    display_logo: 'Logoyu göster',
    display_logo_dark: 'Logoyu göster (koyu)',
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
  },
  roles: {
    name_column: 'Rol',
    description_column: 'Açıklama',
    assign_button: 'Rolleri Ata',
    delete_description:
      'Bu işlem bu rolü bu makine günlüğünden kaldıracaktır. Rol kendisi hala var olacak, ancak artık makine-makine uygulamasıyla ilişkilendirilmeyecektir.',
    deleted: '{{name}}, bu kullanıcıdan başarıyla kaldırıldı.',
    assign_title: "{{name}}'a rolleri atayın",
    assign_subtitle: '{{name}} için bir veya daha fazla rol yetkilendirin',
    assign_role_field: 'Rolleri Ata',
    role_search_placeholder: 'Rol adıyla arama yapın',
    added_text: '{{value, number}} eklendi',
    assigned_app_count: '{{value, number}} uygulamalar',
    confirm_assign: 'Rolleri Ata',
    role_assigned: 'Başarıyla rol(ler) atandı',
    search: "Rol adı, açıklaması veya ID'si ile arama yapın",
    empty: 'Mevcut rol yok',
  },
};

export default Object.freeze(application_details);
