const single_sign_on = {
  forbidden_domains: 'Genel e-posta alanı domainleri izin verilmiyor.',
  duplicated_domains: 'Yinelenmiş domainler bulunmaktadır.',
  invalid_domain_format: 'Geçersiz domain formatı.',
  duplicate_connector_name: 'Bağlayıcı adı zaten var. Lütfen farklı bir ad seçin.',
  idp_initiated_authentication_not_supported:
    'IdP başlatılan kimlik doğrulama, yalnızca SAML bağlayıcıları için desteklenmektedir.',
  idp_initiated_authentication_invalid_application_type:
    'Geçersiz uygulama türü. Yalnızca {{type}} uygulamalarına izin veriliyor.',
  idp_initiated_authentication_redirect_uri_not_registered:
    'redirect_uri kaydedilmemiş. Lütfen uygulama ayarlarını kontrol edin.',
  idp_initiated_authentication_client_callback_uri_not_found:
    "İstemci IdP başlatılan kimlik doğrulama geri dönüş URI'si bulunamadı. Lütfen bağlayıcı ayarlarını kontrol edin.",
  sso_signing_unavailable:
    'Kimlik sağlayıcınızla oturum açma tamamlanamadı. Lütfen yöneticinizle iletişime geçin.',
  can_not_delete_active_signing_key:
    'Aktif imzalama anahtarı silinemez. Önce başka bir anahtarı etkinleştirin veya bu anahtarı devre dışı bırakın.',
  can_not_deactivate_signing_key_in_use:
    'İmzalı kimlik doğrulama istekleri etkinken imzalama anahtarı devre dışı bırakılamaz. Önce imzalı kimlik doğrulama isteklerini devre dışı bırakın.',
  active_signing_key_required:
    'Aktif imzalama anahtarı bulunamadı. İmzalı kimlik doğrulama isteklerini etkinleştirmeden önce bir imzalama anahtarı oluşturun ve etkinleştirin.',
};

export default Object.freeze(single_sign_on);
