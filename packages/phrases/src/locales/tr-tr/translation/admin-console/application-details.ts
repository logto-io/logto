const application_details = {
  page_title: 'Uygulama detayları',
  back_to_applications: 'Uygulamalara geri dön',
  check_guide: 'Kılavuza Göz At',
  settings: 'Ayarlar',
  settings_description:
    'Uygulamalar, Logto için OIDC, oturum açma deneyimi, denetim kayıtları vb. alanlarda uygulamalarınızı tanımlamak için kullanılır.',
  advanced_settings: 'Gelişmiş ayarlar',
  advanced_settings_description:
    'Gelişmiş ayarlar, OIDC ile ilgili terimleri içerir. Daha fazla bilgi için Token Bitiş Noktasına bakabilirsiniz.',
  application_roles: 'Roller',
  machine_logs: 'Makine günlükleri',
  application_name: 'Uygulama Adı',
  application_name_placeholder: 'Uygulamam',
  description: 'Açıklama',
  description_placeholder: 'Uygulama açıklamasını giriniz',
  config_endpoint: 'OpenID Provider yapılandırma bitiş noktası',
  authorization_endpoint: 'Yetkilendirme bitiş noktası',
  authorization_endpoint_tip:
    'Kimlik doğrulama ve yetkilendirme gerçekleştirmek için bitiş noktası. OpenID Connect <a>Authentication</a> için kullanılır.',
  logto_endpoint: 'Logto bitiş noktası',
  application_id: 'Uygulama IDsi',
  application_id_tip:
    'Logto tarafından normalde oluşturulan benzersiz uygulama tanımlayıcısıdır. Ayrıca OpenID Connect "client_id" anlamına gelir.',
  application_secret: 'Uygulama Sırrı',
  redirect_uri: 'Yönlendirme URIı',
  redirect_uris: 'Yönlendirme URIları',
  redirect_uri_placeholder: 'https://siteniz.com/uygulama',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI, kullanıcının oturum açma işlemi tamamlandıktan sonra yönlendirir (başarılı olsa da olmasa da). Ayrıntılı bilgi için OpenID Connect <a>AuthRequesta</a> bakınız.',
  post_sign_out_redirect_uri: 'Oturumdan Çıkış sonrası yönlendirme URIı',
  post_sign_out_redirect_uris: 'Oturumdan Çıkış sonrası yönlendirme URIları',
  post_sign_out_redirect_uri_placeholder: 'https://siteniz.com/anasayfa',
  post_sign_out_redirect_uri_tip:
    'URI, Oturumdan Çıkış sonrası yönlendirme yapar (isteğe bağlıdır). Bazı uygulama türlerinde pratik bir etkisi olmayabilir.',
  cors_allowed_origins: 'CORS izinli originler',
  cors_allowed_origins_placeholder: 'https://siteniz.com',
  cors_allowed_origins_tip:
    'Varsayılan olarak, Yönlendirme URIlerinin tüm originlerine izin verilir. Genellikle bu alan için herhangi bir işlem gerekmez. Ayrıntılı bilgi için <a>MDN doc</a> sayfasına bakın.',
  token_endpoint: 'Token bitiş noktası',
  user_info_endpoint: 'Userinfo bitiş noktası',
  enable_admin_access: 'Yönetici erişimini etkinleştir',
  enable_admin_access_label:
    "Yönetim API erişimine izin verme veya engelleme. Etkinleştirildikten sonra, bu uygulama adına yönetim API'sini çağırmak için erişim belirteçleri kullanabilirsiniz.",
  always_issue_refresh_token: 'Her zaman Refresh Token ver',
  always_issue_refresh_token_label:
    "Bu yapılandırmayı etkinleştirmek, Logto'nun OpenID Connect ile uyumlu olmayan ve olası sorunlara neden olabilecek her zaman Refresh Token çıkarmasına izin verir `prompt=consent` kimlik doğrulama isteğinin sunulup sunulmadığına bakılmaksızın. Ancak, bu uygulama yalnızca zorunlu olduğunda caydırılmayan bir uygulamadır.",
  refresh_token_ttl: 'Refresh Token süresi (gün cinsinden)',
  refresh_token_ttl_tip:
    'Yeni erişim belirteği istekleri için Refresh Belirteği kullanılabilecek süre. Belirteğin süresi dolmadan önce yapılan talepler belirteğin ömrünü uzatacaktır.',
  rotate_refresh_token: 'Refresh Tokenı değiştir',
  rotate_refresh_token_label:
    "Bu seçenek etkinleştirildiğinde, Logto Token Bitiş Süresinin %70'i geçildiğinde veya belli koşullar sağlandığında yeni bir Refresh Token verecektir. <a>Daha fazlası için tıklayın</a>",
  delete_description:
    'Bu eylem geri alınamaz. Uygulama kalıcı olarak silinecektir. Lütfen onaylamak için uygulama adı <span>{{name}}</span> girin.',
  enter_your_application_name: 'Uygulama adı giriniz',
  application_deleted: '{{name}} Uygulaması başarıyla silindi',
  redirect_uri_required: 'En az 1 yönlendirme URIı girmelisiniz',
  roles: {
    name_column: 'Rol',
    description_column: 'Açıklama',
    assign_button: 'Rolleri Ata',
    delete_description:
      'Bu işlem bu role bu makine-makine uygulamasından kaldıracaktır. Rol kendisi hala var olacak, ancak artık makine-makine uygulamasıyla ilişkilendirilmeyecektir.',
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
