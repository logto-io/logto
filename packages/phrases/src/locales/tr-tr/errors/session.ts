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
    'Too many attempts in a short time. Please try again {{relativeTime}}.',
  unauthorized: 'Lütfen önce oturum açın.',
  unsupported_prompt_name: 'Desteklenmeyen prompt adı.',
  forgot_password_not_enabled: 'Parolamı unuttum özelliği etkin değil.',
  verification_failed:
    'Doğrulama başarısız oldu. Lütfen doğrulama işlemini yeniden başlatın ve tekrar deneyin.',
  connector_validation_session_not_found: 'Token doğrulama için bağlayıcı oturumu bulunamadı.',
  identifier_not_found: 'Kullanıcı kimliği bulunamadı. Lütfen geri gidin ve yeniden giriş yapın.',
  interaction_not_found:
    'Etkileşim oturumu bulunamadı. Lütfen geri gidin ve oturumu yeniden başlatın.',
  not_supported_for_forgot_password: 'This operation is not supported for forgot password.',
  mfa: {
    require_mfa_verification: 'Mfa verification is required to sign in.',
    mfa_sign_in_only: 'Mfa is only available for sign-in interaction.',
    pending_info_not_found: 'Pending MFA info not found, please initiate MFA first.',
    invalid_totp_code: 'Invalid TOTP code.',
    webauthn_verification_failed: 'WebAuthn verification failed.',
    webauthn_verification_not_found: 'WebAuthn verification not found.',
    bind_mfa_existed: 'MFA already exists.',
    backup_code_can_not_be_alone: 'Backup code can not be the only MFA.',
    backup_code_required: 'Backup code is required.',
    invalid_backup_code: 'Invalid backup code.',
    mfa_policy_not_user_controlled: 'MFA policy is not user controlled.',
  },
  sso_enabled: 'Bu e-posta için tek oturum açma etkin. Lütfen SSO ile oturum açın.',
};

export default Object.freeze(session);
