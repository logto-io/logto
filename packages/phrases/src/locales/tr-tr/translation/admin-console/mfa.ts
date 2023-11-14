const mfa = {
  title: 'Çok faktörlü kimlik doğrulama',
  description:
    'Kimlik doğrulama deneyiminizin güvenliğini artırmak için çok faktörlü kimlik doğrulamayı ekleyin.',
  factors: 'Faktörler',
  multi_factors: 'Çoklu faktörler',
  multi_factors_description:
    'Kullanıcılar, 2 aşamalı doğrulama için etkinleştirilmiş faktörlerden birini doğrulamalıdır.',
  totp: 'Authenticator uygulama OTP',
  otp_description: 'Google Authenticator vb. bağlayarak tek kullanımlık şifreleri doğrulamak için.',
  webauthn: 'WebAuthn (Pas anahtarı)',
  webauthn_description:
    'Tarayıcı tarafından desteklenen yöntemle doğrulama yapın: biyometri, telefon tarama veya güvenlik anahtarı vb.',
  webauthn_native_tip: 'WebAuthn, Native uygulamalar için desteklenmiyor.',
  webauthn_domain_tip:
    'WebAuthn, genel anahtarları belirli bir alanla ilişkilendirir. Hizmet alanınızı değiştirmek, kullanıcıların mevcut geçiş anahtarları aracılığıyla kimlik doğrulamasını engeller.',
  backup_code: 'Yedek kod',
  backup_code_description:
    'Kullanıcılar herhangi bir MFA yöntemini ayarladıktan sonra 10 tek kullanımlık yedek kod üretir.',
  backup_code_setup_hint:
    'Kullanıcılar yukarıdaki MFA faktörlerini doğrulayamadığında yedek seçeneğini kullanın.',
  backup_code_error_hint:
    'Bir yedek kodu kullanmak için başarılı kullanıcı kimlik doğrulaması için en az bir daha fazla MFA yönteme ihtiyacınız vardır.',
  policy: 'Politika',
  policy_description: 'Giriş ve kaydolma akışları için MFA politikasını belirleyin.',
  two_step_sign_in_policy: 'Girişte 2 aşamalı doğrulama politikası',
  user_controlled:
    "Kullanıcılar MFA'yı kendi başlarına etkinleştirebilir veya devre dışı bırakabilir",
  user_controlled_tip:
    'Kullanıcılar, giriş veya kayıt sırasında ilk kez MFA kurulumunu atlayabilir veya hesap ayarlarında etkinleştirebilir/devre dışı bırakabilir.',
  mandatory: 'Kullanıcılar her zaman girişte MFA kullanmak zorundadır',
  mandatory_tip:
    'Kullanıcılar, ilk kez giriş veya kayıt sırasında MFA kurmalı ve tüm gelecekteki girişlerde kullanmalıdır.',
};

export default Object.freeze(mfa);
