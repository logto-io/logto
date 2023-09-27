const application_details = {
  page_title: 'Uygulama detayları',
  back_to_applications: 'Uygulamalara geri dön',
  check_guide: 'Kılavuza Göz At',
  settings: 'Ayarlar',
  settings_description:
    'Uygulamalar, Logto için OIDC, oturum açma deneyimi, denetim kayıtları vb. alanlarda uygulamalarınızı tanımlamak için kullanılır.',
  /** UNTRANSLATED */
  advanced_settings: 'Advanced settings',
  advanced_settings_description:
    'Gelişmiş ayarlar, OIDC ile ilgili terimleri içerir. Daha fazla bilgi için Token Bitiş Noktasına bakabilirsiniz.',
  /** UNTRANSLATED */
  application_roles: 'Roles',
  /** UNTRANSLATED */
  machine_logs: 'Machine logs',
  application_name: 'Uygulama Adı',
  application_name_placeholder: 'Uygulamam',
  description: 'Açıklama',
  description_placeholder: 'Uygulama açıklamasını giriniz',
  config_endpoint: 'OpenID Provider yapılandırma bitiş noktası',
  authorization_endpoint: 'Yetkilendirme bitiş noktası',
  authorization_endpoint_tip:
    'Kimlik doğrulama ve yetkilendirme gerçekleştirmek için bitiş noktası. OpenID Connect <a>Authentication</a> için kullanılır.',
  logto_endpoint: 'Logto endpoint',
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
    'Bu seçenek etkinleştirildiğinde, Logto Token Bitiş Süresinin %70&#39;i geçildiğinde veya belli koşullar sağlandığında yeni bir Refresh Token verecektir. <a>Daha fazlası için tıklayın</a>',
  delete_description:
    'Bu eylem geri alınamaz. Uygulama kalıcı olarak silinecektir. Lütfen onaylamak için uygulama adı <span>{{name}}</span> girin.',
  enter_your_application_name: 'Uygulama adı giriniz',
  application_deleted: '{{name}} Uygulaması başarıyla silindi',
  redirect_uri_required: 'En az 1 yönlendirme URIı girmelisiniz',
  roles: {
    /** UNTRANSLATED */
    name_column: 'Role',
    /** UNTRANSLATED */
    description_column: 'Description',
    /** UNTRANSLATED */
    assign_button: 'Assign Roles',
    /** UNTRANSLATED */
    delete_description:
      'This action will remove this role from this machine-to-machine app. The role itself will still exist, but it will no longer be associated with this machine-to-machine app.',
    /** UNTRANSLATED */
    deleted: '{{name}} was successfully removed from this user.',
    /** UNTRANSLATED */
    assign_title: 'Assign roles to {{name}}',
    /** UNTRANSLATED */
    assign_subtitle: 'Authorize {{name}} one or more roles',
    /** UNTRANSLATED */
    assign_role_field: 'Assign roles',
    /** UNTRANSLATED */
    role_search_placeholder: 'Search by role name',
    /** UNTRANSLATED */
    added_text: '{{value, number}} added',
    /** UNTRANSLATED */
    assigned_app_count: '{{value, number}} applications',
    /** UNTRANSLATED */
    confirm_assign: 'Assign roles',
    /** UNTRANSLATED */
    role_assigned: 'Successfully assigned role(s)',
    /** UNTRANSLATED */
    search: 'Search by role name, description or ID',
    /** UNTRANSLATED */
    empty: 'No role available',
  },
};

export default Object.freeze(application_details);
