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
  email_verification_code: 'E-posta doğrulama kodu',
  email_verification_code_description:
    'Doğrulama kodlarını almak ve doğrulamak için e-posta adresini bağlayın.',
  phone_verification_code: 'SMS doğrulama kodu',
  phone_verification_code_description:
    'SMS doğrulama kodlarını almak ve doğrulamak için telefon numarasını bağlayın.',
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
  require_mfa: 'MFA Gerektir',
  require_mfa_label:
    "Uygulamalarınıza erişim için 2 aşamalı doğrulamayı zorunlu hale getirmek üzere bunu etkinleştirin. Eğer devre dışıysa, kullanıcılar MFA'yı kendileri için etkinleştirip etkinleştirmemeye karar verebilir.",
  set_up_prompt: 'MFA kurulum istemi',
  no_prompt: 'Kullanıcılardan MFA kurmalarını istemeyin',
  prompt_at_sign_in_and_sign_up:
    'Kaydolurken kullanıcılardan MFA kurmalarını isteyin (atlanabilir, tek seferlik istek)',
  prompt_only_at_sign_in:
    'Kayıttan sonraki ilk giriş denemelerinde kullanıcılardan MFA kurmalarını isteyin (atlanabilir, tek seferlik istek)',
  set_up_organization_required_mfa_prompt:
    "Organizasyon MFA'yı etkinleştirdikten sonra kullanıcılardan MFA kurmalarını isteyin",
  prompt_at_sign_in_no_skip:
    'Bir sonraki girişte kullanıcılardan MFA kurmalarını isteyin (atlanamaz)',
  email_primary_method_tip:
    'E-posta doğrulama kodu zaten birincil oturum açma yönteminizdir. Güvenliği sağlamak için MFA için tekrar kullanılamaz.',
  phone_primary_method_tip:
    'SMS doğrulama kodu zaten birincil oturum açma yönteminizdir. Güvenliği sağlamak için MFA için tekrar kullanılamaz.',
  no_email_connector_warning:
    'Henüz hiçbir e-posta bağlantısı kurulmamış. Yapılandırma tamamlanmadan önce, kullanıcılar MFA için e-posta doğrulama kodlarını kullanamayacaklar. "Bağlantılar"da <a>{{link}}</a>.',
  no_sms_connector_warning:
    'Henüz hiçbir SMS bağlantısı kurulmamış. Yapılandırma tamamlanmadan önce, kullanıcılar MFA için SMS doğrulama kodlarını kullanamayacaklar. "Bağlantılar"da <a>{{link}}</a>.',
  no_email_connector_error:
    'E-posta bağlantısı olmadan e-posta doğrulama kodu MFA etkinleştirilemez. Lütfen önce bir e-posta bağlantısı yapılandırın.',
  no_sms_connector_error:
    'SMS bağlantısı olmadan SMS doğrulama kodu MFA etkinleştirilemez. Lütfen önce bir SMS bağlantısı yapılandırın.',
  setup_link: 'Kur',
};

export default Object.freeze(mfa);
