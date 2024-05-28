const application = {
  invalid_type: 'Sadece makine ile makine uygulamaları rollerle ilişkilendirilebilir.',
  role_exists: 'Bu uygulamaya zaten {{roleId}} kimlikli bir rol eklenmiş.',
  invalid_role_type: 'Kullanıcı tipi rolü makine ile makine uygulamasına atayamaz.',
  invalid_third_party_application_type:
    'Sadece geleneksel web uygulamaları üçüncü taraf uygulaması olarak işaretlenebilir.',
  third_party_application_only: 'Bu özellik sadece üçüncü taraf uygulamalar için geçerlidir.',
  user_consent_scopes_not_found: 'Geçersiz kullanıcı onay kapsamları.',
  consent_management_api_scopes_not_allowed: 'Yönetim API kapsamları izin verilmiyor.',
  protected_app_metadata_is_required: 'Korunan uygulama meta verileri gereklidir.',
  protected_app_not_configured:
    'Korunan uygulama sağlayıcısı yapılandırılmamıştır. Bu özellik açık kaynak sürümü için mevcut değil.',
  cloudflare_unknown_error: 'Cloudflare API isteği sırasında bilinmeyen hata alındı',
  protected_application_only: 'Özellik sadece korunan uygulamalar için geçerlidir.',
  protected_application_misconfigured: 'Korunan uygulama yanlış yapılandırılmış.',
  protected_application_subdomain_exists: 'Korunan uygulama alt alan adı zaten kullanımda.',
  invalid_subdomain: 'Geçersiz alt alan adı.',
  custom_domain_not_found: 'Özel domain bulunamadı.',
  should_delete_custom_domains_first: 'Özel domainleri önce silmelisiniz.',
};

export default Object.freeze(application);
