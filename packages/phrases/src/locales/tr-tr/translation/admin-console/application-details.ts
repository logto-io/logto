const application_details = {
  page_title: 'Uygulama detayları',
  back_to_applications: 'Uygulamalara geri dön',
  check_guide: 'Kılavuza Göz At',
  settings: 'Ayarlar',
  settings_description:
    'Uygulamalar, Logto için OIDC, oturum açma deneyimi, denetim kayıtları vb. alanlarda uygulamalarınızı tanımlamak için kullanılır.',
  advanced_settings: 'Gelişmiş Ayarlar',
  advanced_settings_description:
    'Gelişmiş ayarlar, OIDC ile ilgili terimleri içerir. Daha fazla bilgi için Token Bitiş Noktasına bakabilirsiniz.',
  application_name: 'Uygulama Adı',
  application_name_placeholder: 'Uygulamam',
  description: 'Açıklama',
  description_placeholder: 'Uygulama açıklamasını giriniz',
  config_endpoint: 'OpenID Provider configuration endpoint', // UNTRANSLATED
  authorization_endpoint: 'Yetkilendirme bitiş noktası',
  authorization_endpoint_tip:
    'Kimlik doğrulama ve yetkilendirme gerçekleştirmek için bitiş noktası. OpenID Connect <a>Authentication</a> için kullanılır.',
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
  id_token_expiration: 'ID Token sona erme süresi',
  refresh_token_expiration: 'Refresh Token sona erme süresi',
  token_endpoint: 'Token bitiş noktası',
  user_info_endpoint: 'Userinfo bitiş noktası',
  enable_admin_access: 'Yönetici erişimini etkinleştir',
  enable_admin_access_label:
    "Yönetim API erişimine izin verme veya engelleme. Etkinleştirildikten sonra, bu uygulama adına yönetim API'sini çağırmak için erişim belirteçleri kullanabilirsiniz.",
  always_issue_refresh_token: 'Her zaman Refresh Token ver',
  always_issue_refresh_token_label:
    "Bu yapılandırmayı etkinleştirmek, Logto'nun OpenID Connect ile uyumlu olmayan ve olası sorunlara neden olabilecek her zaman Refresh Token çıkarmasına izin verir `prompt=consent` kimlik doğrulama isteğinin sunulup sunulmadığına bakılmaksızın. Ancak, bu uygulama yalnızca zorunlu olduğunda caydırılmayan bir uygulamadır.",
  refresh_token_ttl: 'Refresh Token Time to Live (TTL) in days', // UNTRANSLATED
  refresh_token_ttl_tip:
    'The duration for which a Refresh Token can be used to request new access tokens before it expires and becomes invalid. Token requests will extend the TTL of the Refresh Token to this value.', // UNTRANSLATED
  rotate_refresh_token: 'Rotate Refresh Token', // UNTRANSLATED
  rotate_refresh_token_label:
    'When enabled, Logto will issue a new Refresh Token for token requests when 70% of the original Time to Live (TTL) has passed or certain conditions are met. <a>Learn more</a>', // UNTRANSLATED
  delete_description:
    'Bu eylem geri alınamaz. Uygulama kalıcı olarak silinecektir. Lütfen onaylamak için uygulama adı <span>{{name}}</span> girin.',
  enter_your_application_name: 'Uygulama adı giriniz',
  application_deleted: '{{name}} Uygulaması başarıyla silindi',
  redirect_uri_required: 'En az 1 yönlendirme URIı girmelisiniz',
};

export default application_details;
