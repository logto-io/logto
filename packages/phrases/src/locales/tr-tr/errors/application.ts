const application = {
  invalid_type: 'Sadece makine ile makine uygulamaları rollerle ilişkilendirilebilir.',
  role_exists: 'Bu uygulamaya zaten {{roleId}} kimlikli bir rol eklenmiş.',
  invalid_role_type: 'Kullanıcı tipi rolü makine ile makine uygulamasına atayamaz.',
  invalid_third_party_application_type:
    'Sadece geleneksel web, tek sayfalı ve yerel uygulamalar üçüncü taraf uygulaması olarak işaretlenebilir.',
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
  no_legacy_secret_found: 'Uygulamanın eski bir gizli anahtarı yok.',
  secret_name_exists: 'Gizli isim zaten mevcut.',
  saml: {
    use_saml_app_api:
      "`[METHOD] /saml-applications(/.*)?` API'sini SAML uygulamasını çalıştırmak için kullanın.",
    saml_application_only: 'API sadece SAML uygulamaları için kullanılabilir.',
    reach_oss_limit:
      '{{limit}} sınırına ulaşıldığı için daha fazla SAML uygulaması oluşturamazsınız.',
    acs_url_binding_not_supported:
      'SAML iddialarını almak için sadece HTTP-POST bağlaması desteklenir.',
    can_not_delete_active_secret: 'Aktif gizli anahtar silinemez.',
    no_active_secret: 'Aktif gizli anahtar bulunamadı.',
    entity_id_required: 'Meta verileri oluşturmak için Kimlik Varlığı gereklidir.',
    name_id_format_required: 'Kimlik Adı formatı gereklidir.',
    unsupported_name_id_format: 'Desteklenmeyen Kimlik Adı formatı.',
    missing_email_address: 'Kullanıcının bir e-posta adresi yok.',
    email_address_unverified: 'Kullanıcının e-posta adresi doğrulanmadı.',
    invalid_certificate_pem_format: 'Geçersiz PEM sertifika formatı',
    acs_url_required: "İddia Alıcısı Servisi URL'si gereklidir.",
    private_key_required: 'Özel anahtar gereklidir.',
    certificate_required: 'Sertifika gereklidir.',
    invalid_saml_request: 'Geçersiz SAML kimlik doğrulama isteği.',
    auth_request_issuer_not_match:
      "SAML kimlik doğrulama isteğinin veren kimliği, hizmet sağlayıcı kimlik varlığı ID'si ile eşleşmiyor.",
    sp_initiated_saml_sso_session_not_found_in_cookies:
      "Hizmet sağlayıcı tarafından başlatılan SAML SSO oturum ID'si çerezlerde bulunamadı.",
    sp_initiated_saml_sso_session_not_found:
      'Hizmet sağlayıcı tarafından başlatılan SAML SSO oturumu bulunamadı.',
    state_mismatch: '`state` uyuşmazlığı.',
  },
};

export default Object.freeze(application);
