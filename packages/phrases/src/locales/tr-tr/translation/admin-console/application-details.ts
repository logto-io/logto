const application_details = {
  back_to_applications: 'Uygulamalara geri dön',
  check_guide: 'Kılavuza Göz At',
  advanced_settings: 'Gelişmiş Ayarlar',
  application_name: 'Uygulama Adı',
  application_name_placeholder: 'Uygulamam',
  description: 'Açıklama',
  description_placeholder: 'Uygulama açıklamasını giriniz',
  authorization_endpoint: 'Yetkilendirme bitiş noktası',
  authorization_endpoint_tip:
    'Kimlik doğrulama ve yetkilendirme gerçekleştirmek için bitiş noktası. OpenID Connect Authentication için kullanılır.',
  application_secret: 'Uygulama Sırrı',
  redirect_uri: 'Yönlendirme URIı',
  redirect_uris: 'Yönlendirme URIları',
  redirect_uri_placeholder: 'https://your.website.com/app',
  redirect_uri_placeholder_native: 'io.logto://callback',
  redirect_uri_tip:
    'URI kullanıcı oturum açma işlemiden sonra yönlendirir (Başarılı olsa da olmasa da). Detaylı bilgi için OpenID Connect AuthRequesta bakınız.',
  post_sign_out_redirect_uri: 'Oturumdan Çıkış sonrası yönlendirme URIı',
  post_sign_out_redirect_uris: 'Oturumdan Çıkış sonrası yönlendirme URIları',
  post_sign_out_redirect_uri_placeholder: 'https://your.website.com/home',
  post_sign_out_redirect_uri_tip:
    'URI Oturumdan Çıkış sonrası yönlendirir(opsiyonel). Bazı uygulama türlerinde pratik bir etkisi olmayabilir.',
  cors_allowed_origins: 'CORS izinli originler',
  cors_allowed_origins_placeholder: 'https://your.website.com',
  cors_allowed_origins_tip:
    'Varsayılan olarak, Yönlendirme URIlerinin tüm originlerine izin verilir. Genellikle bu alan için herhangi bir işlem gerekmez.',
  add_another: 'Bir tane daha ekle',
  id_token_expiration: 'ID Token sona erme süresi',
  refresh_token_expiration: 'Refresh Token sona erme süresi',
  token_endpoint: 'Token bitiş noktası',
  user_info_endpoint: 'Userinfo bitiş noktası',
  delete_description:
    'Bu eylem geri alınamaz. Uygulama kalıcı olarak silinecektir. Lütfen onaylamak için uygulama adı <span>{{name}}</span> girin.',
  enter_your_application_name: 'Uygulama adı giriniz',
  application_deleted: '{{name}} Uygulaması başarıyla silindi',
  redirect_uri_required: 'En az 1 yönlendirme URIı girmelisiniz',
};

export default application_details;
