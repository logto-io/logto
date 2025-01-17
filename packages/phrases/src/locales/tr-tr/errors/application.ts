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
  no_legacy_secret_found: 'Uygulamanın eski bir gizli anahtarı yok.',
  secret_name_exists: 'Gizli isim zaten mevcut.',
  saml: {
    /** UNTRANSLATED */
    use_saml_app_api: 'Use `[METHOD] /saml-applications(/.*)?` API to operate SAML app.',
    /** UNTRANSLATED */
    saml_application_only: 'The API is only available for SAML applications.',
    /** UNTRANSLATED */
    acs_url_binding_not_supported:
      'Only HTTP-POST binding is supported for receiving SAML assertions.',
    /** UNTRANSLATED */
    can_not_delete_active_secret: 'Can not delete the active secret.',
    /** UNTRANSLATED */
    no_active_secret: 'No active secret found.',
    /** UNTRANSLATED */
    entity_id_required: 'Entity ID is required to generate metadata.',
    /** UNTRANSLATED */
    name_id_format_required: 'Name ID format is required.',
    /** UNTRANSLATED */
    unsupported_name_id_format: 'Unsupported name ID format.',
    /** UNTRANSLATED */
    missing_email_address: 'User does not have an email address.',
    /** UNTRANSLATED */
    email_address_unverified: 'User email address is not verified.',
    /** UNTRANSLATED */
    invalid_certificate_pem_format: 'Invalid PEM certificate format',
    /** UNTRANSLATED */
    acs_url_required: 'Assertion Consumer Service URL is required.',
    /** UNTRANSLATED */
    private_key_required: 'Private key is required.',
    /** UNTRANSLATED */
    certificate_required: 'Certificate is required.',
    /** UNTRANSLATED */
    invalid_saml_request: 'Invalid SAML authentication request.',
    /** UNTRANSLATED */
    auth_request_issuer_not_match:
      'The issuer of the SAML authentication request mismatch with service provider entity ID.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found_in_cookies:
      'Service provider initiated SAML SSO session ID not found in cookies.',
    /** UNTRANSLATED */
    sp_initiated_saml_sso_session_not_found:
      'Service provider initiated SAML SSO session not found.',
    /** UNTRANSLATED */
    state_mismatch: '`state` mismatch.',
  },
};

export default Object.freeze(application);
