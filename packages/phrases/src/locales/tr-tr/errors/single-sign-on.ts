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
};

export default Object.freeze(single_sign_on);
