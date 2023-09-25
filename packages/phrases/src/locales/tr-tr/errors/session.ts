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
  /** UNTRANSLATED */
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
  mfa: {
    /** UNTRANSLATED */
    pending_info_not_found: 'Pending MFA info not found, please initiate MFA first.',
    /** UNTRANSLATED */
    invalid_totp_code: 'Invalid TOTP code.',
  },
};

export default Object.freeze(session);
