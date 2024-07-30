const session = {
  not_found: 'Oturum bulunamadı. Lütfen geri dönüp giriş yapınız.',
  invalid_credentials: 'Geçersiz kimlik bilgileri. Lütfen girdinizi kontrol ediniz.',
  invalid_sign_in_method: 'Geçerli oturum açma yöntemi kullanılamıyor.',
  invalid_connector_id: '{{connectorId}} idsi ile kullanılabilir bağlayıcı bulunamıyor.',
  insufficient_info: 'Yetersiz oturum açma bilgisi.',
  connector_id_mismatch: 'connectorId, oturum kaydı ile eşleşmiyor.',
  connector_session_not_found:
    'Bağlayıcı oturum bulunamadı. Lütfen geri dönüp tekrardan giriş yapınız.',
  verification_session_not_found:
    'Doğrulama başarısız oldu. Lütfen doğrulama işlemini yeniden başlatın ve tekrar deneyin.',
  verification_expired:
    'Bağlantı zaman aşımına uğradı. Hesap güvenliğiniz için yeniden doğrulama yapın.',
  verification_blocked_too_many_attempts:
    'Kısa sürede çok fazla deneme yapıldı. Lütfen {{relativeTime}} sonra tekrar deneyin.',
  unauthorized: 'Lütfen önce oturum açın.',
  unsupported_prompt_name: 'Desteklenmeyen prompt adı.',
  forgot_password_not_enabled: 'Parolamı unuttum özelliği etkin değil.',
  verification_failed:
    'Doğrulama başarısız oldu. Lütfen doğrulama işlemini yeniden başlatın ve tekrar deneyin.',
  connector_validation_session_not_found: 'Token doğrulama için bağlayıcı oturumu bulunamadı.',
  csrf_token_mismatch: 'CSRF belirteci eşleşmedi.',
  identifier_not_found: 'Kullanıcı kimliği bulunamadı. Lütfen geri gidin ve yeniden giriş yapın.',
  interaction_not_found:
    'Etkileşim oturumu bulunamadı. Lütfen geri gidin ve oturumu yeniden başlatın.',
  not_supported_for_forgot_password: 'Parolamı unuttum için bu işlem desteklenmiyor.',
  identity_conflict:
    'Kimlik uyuşmazlığı tespit edildi. Farklı bir kimlikle devam etmek için yeni bir oturum başlatın.',
  mfa: {
    require_mfa_verification: 'Oturum açmak için Mfa doğrulaması gereklidir.',
    mfa_sign_in_only: 'Mfa yalnızca oturum açma etkileşimi için kullanılabilir.',
    pending_info_not_found: 'Bekleyen MFA bilgisi bulunamadı, lütfen önce MFA başlatın.',
    invalid_totp_code: 'Geçersiz TOTP kodu.',
    webauthn_verification_failed: 'WebAuthn doğrulaması başarısız oldu.',
    webauthn_verification_not_found: 'WebAuthn doğrulaması bulunamadı.',
    bind_mfa_existed: 'MFA zaten mevcut.',
    backup_code_can_not_be_alone: 'Yedek kod yalnızca tek başına MFA olamaz.',
    backup_code_required: 'Yedek kod gereklidir.',
    invalid_backup_code: 'Geçersiz yedek kod.',
    mfa_policy_not_user_controlled: 'MFA politikası kullanıcı tarafından kontrol edilmez.',
  },
  sso_enabled: 'Bu e-posta için tek oturum açma etkin. Lütfen SSO ile oturum açın.',
};

export default Object.freeze(session);
