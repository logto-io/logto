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
  webauthn: 'WebAuthn',
  webauthn_description:
    'WebAuthn, YubiKey dahil olmak üzere kullanıcının cihazını doğrulamak için geçiş anahtarını kullanır.',
  backup_code: 'Yedek kod',
  backup_code_description:
    'Tek kullanımlık bir kimlik doğrulama için kullanılabilen 10 benzersiz kod üretin.',
  backup_code_setup_hint: 'Tek başına etkinleştirilemeyen yedek kimlik doğrulama faktörü:',
  backup_code_error_hint:
    'Çoklu faktör kimlik doğrulamada yedek kodu kullanmak için kullanıcılarınızın başarılı giriş yapmalarını sağlamak için diğer faktörlerin etkinleştirilmiş olması gerekir.',
  policy: 'Politika',
  two_step_sign_in_policy: 'Giriş sırasında iki adımlı kimlik doğrulama politikası',
  two_step_sign_in_policy_description:
    'Giriş sırasında tüm uygulama genelinde iki adımlı kimlik doğrulama gereksinimi tanımlayın.',
  user_controlled: 'Kullanıcı tarafından kontrol edilen',
  user_controlled_description:
    'Varsayılan olarak devre dışı bırakılmış ve zorunlu değildir, ancak kullanıcılar ayrı ayrı etkinleştirebilirler.',
  mandatory: 'Zorunlu',
  mandatory_description:
    'Her girişte tüm kullanıcılarınız için çoklu faktör kimlik doğrulamayı gerektirin.',
  unlock_reminder:
    'Güvenliği doğrulamak için çoklu faktör kimlik doğrulamayı kilit açmak için bir ücretli plana yükselterek etkinleştirin. Yardıma ihtiyacınız varsa çekinmeden <a>bizimle iletişime geçin</a>.',
  view_plans: 'Planları görüntüle',
};

export default Object.freeze(mfa);
