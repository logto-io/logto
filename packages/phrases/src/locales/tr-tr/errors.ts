const errors = {
  request: {
    invalid_input: 'Input is invalid. {{details}}', // UNTRANSLATED
    general: 'Request error occurred.', // UNTRANSLATED
  },
  auth: {
    authorization_header_missing: 'Yetkilendirme başlığı eksik.',
    authorization_token_type_not_supported: 'Yetkilendirme tipi desteklenmiyor.',
    unauthorized: 'Yetki yok. Lütfen kimlik bilgilerini ve kapsamını kontrol edin.',
    forbidden: 'Yasak. Lütfen kullanıcı rollerinizi ve izinlerinizi kontrol edin.',
    expected_role_not_found:
      'Expected role not found. Please check your user roles and permissions.',
    jwt_sub_missing: 'JWTde `sub` eksik.',
    require_re_authentication: 'Re-authentication is required to perform a protected action.', // UNTRANSLATED
  },
  guard: {
    invalid_input: 'İstek {{type}} geçersiz.',
    invalid_pagination: 'İstenen sayfalandırma değeri geçersiz.',
    can_not_get_tenant_id: 'Unable to get tenant id from request.', // UNTRANSLATED
    file_size_exceeded: 'File size exceeded.', // UNTRANSLATED
    mime_type_not_allowed: 'MIME type is not allowed.', // UNTRANSLATED
  },
  oidc: {
    aborted: 'Son kullanıcı etkileşimi iptal etti.',
    invalid_scope: '{{scope}} kapsamı desteklenmiyor.',
    invalid_scope_plural: '{{scopes}} kapsamları desteklenmiyor.',
    invalid_token: 'Sağlanan token geçersiz.',
    invalid_client_metadata: 'Sağlanan müşteri metadatası geçersiz.',
    insufficient_scope: 'Erişim tokenı istenen {{scopes}} kapsamında eksik.',
    invalid_request: 'İstek geçersiz.',
    invalid_grant: 'Hibe talebi geçersiz.',
    invalid_redirect_uri:
      '`redirect_uri` müşterilerin kayıtlı `redirect_uris` Lerinin hiçbiri ile eşleşmedi',
    access_denied: 'Erişim engellendi.',
    invalid_target: 'Geçersiz kaynak göstergesi.',
    unsupported_grant_type: 'Desteklenmeyen `grant_type` istendi.',
    unsupported_response_mode: 'Desteklenmeye `response_mode` istendi.',
    unsupported_response_type: 'Desteklenmeyen `response_type` istendi.',
    provider_error: 'Dahili OIDC Hatası: {{message}}.',
  },
  user: {
    username_already_in_use: 'This username is already in use.', // UNTRANSLATED
    email_already_in_use: 'This email is associated with an existing account.', // UNTRANSLATED
    phone_already_in_use: 'This phone number is associated with an existing account.', // UNTRANSLATED
    invalid_email: 'Geçersiz e-posta adresi.',
    invalid_phone: 'Geçersiz telefon numarası.',
    email_not_exist: 'E-posta adresi henüz kaydedilmedi.',
    phone_not_exist: 'Telefon numarası henüz kaydedilmedi',
    identity_not_exist: 'Sosyal platform hesabı henüz kaydedilmedi.',
    identity_already_in_use: 'Sosyal platform hesabı kaydedildi.',
    social_account_exists_in_profile: 'You have already associated this social account.', // UNTRANSLATED
    cannot_delete_self: 'You cannot delete yourself.', // UNTRANSLATED
    sign_up_method_not_enabled: 'This sign-up method is not enabled.', // UNTRANSLATED
    sign_in_method_not_enabled: 'This sign-in method is not enabled.', // UNTRANSLATED
    same_password: 'New password cannot be the same as your old password.', // UNTRANSLATED
    password_required_in_profile: 'You need to set a password before signing-in.', // UNTRANSLATED
    new_password_required_in_profile: 'You need to set a new password.', // UNTRANSLATED
    password_exists_in_profile: 'Password already exists in your profile.', // UNTRANSLATED
    username_required_in_profile: 'You need to set a username before signing-in.', // UNTRANSLATED
    username_exists_in_profile: 'Username already exists in your profile.', // UNTRANSLATED
    email_required_in_profile: 'You need to add an email address before signing-in.', // UNTRANSLATED
    email_exists_in_profile: 'Your profile has already associated with an email address.', // UNTRANSLATED
    phone_required_in_profile: 'You need to add a phone number before signing-in.', // UNTRANSLATED
    phone_exists_in_profile: 'Your profile has already associated with a phone number.', // UNTRANSLATED
    email_or_phone_required_in_profile:
      'You need to add an email address or phone number before signing-in.', // UNTRANSLATED
    suspended: 'This account is suspended.', // UNTRANSLATED
    user_not_exist: 'User with {{ identifier }} does not exist.', // UNTRANSLATED,
    missing_profile: 'You need to provide additional info before signing-in.', // UNTRANSLATED
    role_exists: 'The role id {{roleId}} is already been added to this user', // UNTRANSLATED
  },
  password: {
    unsupported_encryption_method: '{{name}} şifreleme metodu desteklenmiyor.',
    pepper_not_found: 'Şifre pepperı bulunamadı. Lütfen core envs.i kontrol edin.',
  },
  session: {
    not_found: 'Oturum bulunamadı. Lütfen geri dönüp giriş yapınız.',
    invalid_credentials: 'Geçersiz kimlik bilgileri. Lütfen girdinizi kontrol ediniz.',
    invalid_sign_in_method: 'Geçerli oturum açma yöntemi kullanılamıyor.',
    invalid_connector_id: '{{connectorId}} idsi ile kullanılabilir bağlayıcı bulunamıyor.',
    insufficient_info: 'Yetersiz oturum açma bilgisi.',
    connector_id_mismatch: 'connectorId, oturum kaydı ile eşleşmiyor.',
    connector_session_not_found:
      'Bağlayıcı oturum bulunamadı. Lütfen geri dönüp tekrardan giriş yapınız.',
    verification_session_not_found:
      'The verification was not successful. Restart the verification flow and try again.', // UNTRANSLATED
    verification_expired:
      'The connection has timed out. Verify again to ensure your account safety.', // UNTRANSLATED
    unauthorized: 'Lütfen önce oturum açın.',
    unsupported_prompt_name: 'Desteklenmeyen prompt adı.',
    forgot_password_not_enabled: 'Forgot password is not enabled.', // UNTRANSLATED
    verification_failed:
      'The verification was not successful. Restart the verification flow and try again.', // UNTRANSLATED
    connector_validation_session_not_found:
      'The connector session for token validation is not found.', // UNTRANSLATED
    identifier_not_found: 'User identifier not found. Please go back and sign in again.', // UNTRANSLATED
    interaction_not_found:
      'Interaction session not found. Please go back and start the session again.', // UNTRANSLATED
  },
  connector: {
    general: 'Bağdaştırıcıda bir hata oluştu: {{errorDescription}}',
    not_found: '{{type}} tipi icin uygun bağlayıcı bulunamadı.',
    not_enabled: 'Bağlayıcı etkin değil.',
    invalid_metadata: "The connector's metadata is invalid.", // UNTRANSLATED
    invalid_config_guard: "The connector's config guard is invalid.", // UNTRANSLATED
    unexpected_type: "The connector's type is unexpected.", // UNTRANSLATED
    invalid_request_parameters: 'The request is with wrong input parameter(s).', // UNTRANSLATED
    insufficient_request_parameters: 'İstek, bazı input parametrelerini atlayabilir.',
    invalid_config: 'Bağlayıcının ayarları geçersiz.',
    invalid_response: 'Bağlayıcının yanıtı geçersiz.',
    template_not_found: 'Bağlayıcı yapılandırmasında doğru şablon bulunamıyor.',
    not_implemented: '{{method}}: henüz uygulanmadı.',
    social_invalid_access_token: 'Bağlayıcının erişim tokenı geçersiz.',
    invalid_auth_code: 'Bağlayıcının yetki kodu geçersiz.',
    social_invalid_id_token: 'Bağlayıcının idsi geçersiz.',
    authorization_failed: 'Kullanıcının yetkilendirme işlemi başarısız oldu.',
    social_auth_code_invalid: 'Erişim tokenı alınamıyor, lütfen yetkilendirme kodunu kontrol edin.',
    more_than_one_sms: 'SMS bağlayıcılarının sayısı 1den fazla.',
    more_than_one_email: 'E-posta adresi bağlayıcılarının sayısı 1den fazla.',
    more_than_one_connector_factory:
      'Found multiple connector factories (with id {{connectorIds}}), you may uninstall unnecessary ones.', // UNTRANSLATED
    db_connector_type_mismatch: 'Dbde türle eşleşmeyen bir bağlayıcı var.',
    not_found_with_connector_id: 'Can not find connector with given standard connector id.', // UNTRANSLATED
    multiple_instances_not_supported:
      'Can not create multiple instance with picked standard connector.', // UNTRANSLATED
    invalid_type_for_syncing_profile: 'You can only sync user profile with social connectors.', // UNTRANSLATED
    can_not_modify_target: "The connector 'target' can not be modified.", // UNTRANSLATED
    should_specify_target: "You should specify 'target'.", // UNTRANSLATED
    multiple_target_with_same_platform:
      'You can not have multiple social connectors that have same target and platform.', // UNTRANSLATED
    cannot_overwrite_metadata_for_non_standard_connector:
      "This connector's 'metadata' cannot be overwritten.", // UNTRANSLATED
  },
  verification_code: {
    phone_email_empty: 'Both phone and email are empty.', // UNTRANSLATED
    not_found: 'Verification code not found. Please send verification code first.', // UNTRANSLATED
    phone_mismatch: 'Phone mismatch. Please request a new verification code.', // UNTRANSLATED
    email_mismatch: 'Email mismatch. Please request a new verification code.', // UNTRANSLATED
    code_mismatch: 'Invalid verification code.', // UNTRANSLATED
    expired: 'Verification code has expired. Please request a new verification code.', // UNTRANSLATED
    exceed_max_try:
      'Verification code retries limitation exceeded. Please request a new verification code.', // UNTRANSLATED
  },
  sign_in_experiences: {
    empty_content_url_of_terms_of_use:
      '"Kullanım Koşulları" İçerik URLi yok. Lütfen "Kullanım Koşulları" etkinse içerik URLi ekleyiniz.',
    empty_social_connectors:
      'Social connectors yok. Sosyal oturum açma yöntemi etkinleştirildiğinde lütfen etkin social connectorları ekleyiniz.',
    enabled_connector_not_found: 'Etkin {{type}} bağlayıcı bulunamadı.',
    not_one_and_only_one_primary_sign_in_method:
      'Yalnızca bir tane birincil oturum açma yöntemi olmalıdır. Lütfen inputu kontrol ediniz.',
    username_requires_password: 'Must enable set a password for username sign up identifier.', // UNTRANSLATED
    passwordless_requires_verify: 'Must enable verify for email/phone sign up identifier.', // UNTRANSLATED
    miss_sign_up_identifier_in_sign_in: 'Sign in methods must contain the sign up identifier.', // UNTRANSLATED
    password_sign_in_must_be_enabled:
      'Password sign in must be enabled when set a password is required in sign up.', // UNTRANSLATED
    code_sign_in_must_be_enabled:
      'Verification code sign in must be enabled when set a password is not required in sign up.', // UNTRANSLATED
    unsupported_default_language: 'This language - {{language}} is not supported at the moment.', // UNTRANSLATED
    at_least_one_authentication_factor: 'You have to select at least one authentication factor.', // UNTRANSLATED
  },
  localization: {
    cannot_delete_default_language:
      '{{languageTag}} is set as your default language and can’t be deleted.', // UNTRANSLATED
    invalid_translation_structure: 'Invalid data schemas. Please check your input and try again.', // UNTRANSLATED
  },
  swagger: {
    invalid_zod_type:
      'Geçersiz Zod tipi. Lütfen yönlendirici koruma yapılandırmasını kontrol ediniz.',
    not_supported_zod_type_for_params:
      'Parametreler için desteklenmeyen Zod tipi. Lütfen yönlendirici koruma yapılandırmasını kontrol ediniz.',
  },
  entity: {
    create_failed: '{{name}} oluşturulamadı.',
    not_exists: '{{name}} mevcut değil.',
    not_exists_with_id: ' `{{id}}` id kimliğine sahip {{name}} mevcut değil.',
    not_found: 'Kaynak mevcut değil.',
  },
  log: {
    invalid_type: 'The log type is invalid.', // UNTRANSLATED
  },
  role: {
    name_in_use: 'This role name {{name}} is already in use', // UNTRANSLATED
    scope_exists: 'The scope id {{scopeId}} has already been added to this role', // UNTRANSLATED
    user_exists: 'The user id {{userId}} is already been added to this role', // UNTRANSLATED
    default_role_missing:
      'Some of the default roleNames does not exist in database, please ensure to create roles first', // UNTRANSLATED
    internal_role_violation:
      'You may be trying to update or delete an internal role which is forbidden by Logto. If you are creating a new role, try another name that does not start with "#internal:".', // UNTRANSLATED
  },
  scope: {
    name_exists: 'The scope name {{name}} is already in use', // UNTRANSLATED
    name_with_space: 'The name of the scope cannot contain any spaces.', // UNTRANSLATED
  },
  storage: {
    not_configured: 'Storage provider is not configured.', // UNTRANSLATED
    missing_parameter: 'Missing parameter {{parameter}} for storage provider.', // UNTRANSLATED
    upload_error: 'Failed to upload file to the storage provider.', // UNTRANSLATED
  },
};

export default errors;
