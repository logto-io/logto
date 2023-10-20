const mfa = {
  title: 'Çoklu Faktör Kimlik Doğrulama',
  description:
    'Giriş deneyiminizin güvenliğini artırmak için çoklu faktör kimlik doğrulamayı ekleyin.',
  factors: 'Faktörler',
  multi_factors: 'Çoklu faktörler',
  multi_factors_description:
    'Kullanıcılar, iki aşamalı kimlik doğrulama için etkinleştirilen faktörlerden birini doğrulamalıdır.',
  totp: 'Authenticator uygulama OTP',
  otp_description:
    'Google Authenticator vb. bağlayarak tek kullanımlık şifreleri doğrulamak için kullanın.',
  /** UNTRANSLATED */
  webauthn: 'WebAuthn(Passkey)',
  /** UNTRANSLATED */
  webauthn_description:
    'Verify via browser-supported method: biometrics, phone scanning, or security key, etc.',
  /** UNTRANSLATED */
  webauthn_native_tip: 'WebAuthn is not supported for Native applications.',
  /** UNTRANSLATED */
  webauthn_domain_tip:
    'WebAuthn binds public keys to the specific domain. Modifying your service domain will block users from authenticating via existing passkeys.',
  backup_code: 'Yedek kod',
  backup_code_description:
    'Tek kullanımlık bir kimlik doğrulama için kullanılabilen 10 benzersiz kod üretin.',
  backup_code_setup_hint: 'Tek başına etkinleştirilemeyen yedek kimlik doğrulama faktörü:',
  backup_code_error_hint:
    'Çoklu faktör kimlik doğrulamada yedek kodu kullanmak için kullanıcılarınızın başarılı giriş yapmalarını sağlamak için diğer faktörlerin etkinleştirilmiş olması gerekir.',
  policy: 'Politika',
  two_step_sign_in_policy: 'Giriş sırasında iki adımlı kimlik doğrulama politikası',
  user_controlled: "Kullanıcılar MFA'yi kişisel olarak etkinleştirmeye karar verebilir.",
  mandatory: 'Her girişte tüm kullanıcılar için zorunlu MFA.',
  unlock_reminder:
    'Güvenliği doğrulamak için çoklu faktör kimlik doğrulamayı kilit açmak için bir ücretli plana yükselterek etkinleştirin. Yardıma ihtiyacınız varsa çekinmeden <a>bizimle iletişime geçin</a>.',
  view_plans: 'Planları görüntüle',
};

export default Object.freeze(mfa);
