const mfa = {
  totp: 'Authenticator uygulaması OTP',
  webauthn: 'Anahtar',
  backup_code: 'Yedek kod',
  email_verification_code: 'E-posta doğrulama kodu',
  phone_verification_code: 'SMS doğrulama kodu',
  link_totp_description: 'Örn., Google Authenticator, vb.',
  link_webauthn_description: 'Cihazınızı veya USB donanımınızı bağlayın',
  link_backup_code_description: 'Yedek kod oluşturun',
  link_email_verification_code_description: 'E-posta adresinizi bağlayın',
  link_email_2fa_description: '2 adımlı doğrulama için e-posta adresinizi bağlayın',
  link_phone_verification_code_description: 'Telefon numaranızı bağlayın',
  link_phone_2fa_description: '2 adımlı doğrulama için telefon numaranızı bağlayın',
  verify_totp_description: 'Uygulamadaki tek kullanımlık kodu girin',
  verify_webauthn_description: 'Cihazınızı veya USB donanımınızı doğrulayın',
  verify_backup_code_description: 'Kaydettiğiniz yedek kodu yapıştırın',
  verify_email_verification_code_description: 'E-postanıza gönderilen kodu girin',
  verify_phone_verification_code_description: 'Telefonunuza gönderilen kodu girin',
  add_mfa_factors: '2 aşamalı doğrulamayı ekle',
  add_mfa_description:
    'İki faktörlü doğrulama etkin. Güvenli giriş için ikinci doğrulama yönteminizi seçin.',
  verify_mfa_factors: '2 aşamalı doğrulama',
  verify_mfa_description:
    'Bu hesap için 2 aşamalı doğrulama etkinleştirildi. Lütfen kimliğinizi doğrulamak için ikinci yolu seçin.',
  add_authenticator_app: 'Authenticator uygulaması ekle',
  step: 'Adım {{step, number}}: {{content}}',
  scan_qr_code: 'Bu QR kodunu tarayın',
  scan_qr_code_description:
    'Bu QR kodunu authenticator uygulamanızla tarayın, örneğin Google Authenticator, Duo Mobile, Authy, vb.',
  qr_code_not_available: 'QR kodu taranamıyor mu?',
  copy_and_paste_key: 'Anahtarı kopyala ve yapıştır',
  copy_and_paste_key_description:
    'Aşağıdaki anahtarı authenticator uygulamanıza kopyala ve yapıştır, örneğin Google Authenticator, Duo Mobile, Authy, vb.',
  want_to_scan_qr_code: 'QR kodunu tarımak mı istiyorsunuz?',
  enter_one_time_code: 'Tek kullanımlık kodu girin',
  enter_one_time_code_link_description:
    'Authenticator uygulaması tarafından oluşturulan 6 haneli doğrulama kodunu girin.',
  enter_one_time_code_description:
    'Bu hesap için iki aşamalı doğrulama etkinleştirildi. Lütfen bağlı kimlik doğrulama uygulamanızda gösterilen tek kullanımlık kodu girin.',
  link_another_mfa_factor: 'Başka bir yönteme geçin',
  save_backup_code: 'Yedek kodunuzu kaydedin',
  save_backup_code_description:
    'Başka bir yöntemle 2 aşamalı doğrulama sırasında sorun yaşarsanız bu yedek kodlardan birini kullanabilirsiniz. Her kod sadece bir kez kullanılabilir.',
  backup_code_hint: 'Onları kopyalayın ve güvenli bir yerde sakladığınızdan emin olun.',
  enter_a_backup_code: 'Bir yedek kod girin',
  enter_backup_code_description:
    'İlk olarak 2 aşamalı doğrulama etkinleştirildiğinde kaydettiğiniz yedek kodu girin.',
  create_a_passkey: 'Bir anahtar oluşturun',
  create_passkey_description:
    'Cihaz biyometrisi, güvenlik anahtarları (örneğin YubiKey) veya diğer kullanılabilir yöntemler kullanarak anahtarınızı kaydedin.',
  try_another_verification_method: 'Başka bir doğrulama yöntemini deneyin',
  verify_via_passkey: 'Anahtar ile doğrula',
  verify_via_passkey_description:
    'Anahtar kullanarak cihaz parolanız veya biyometri ile doğrulama, QR kodunu tarama veya YubiKey gibi USB güvenlik anahtarı kullanma.',
  secret_key_copied: 'Gizli anahtar kopyalandı.',
  backup_code_copied: 'Yedek kod kopyalandı.',
  webauthn_not_ready: 'WebAuthn henüz hazır değil. Lütfen daha sonra tekrar deneyin.',
  webauthn_not_supported: 'Bu tarayıcıda WebAuthn desteklenmiyor.',
  webauthn_failed_to_create: 'Oluşturulamadı. Lütfen tekrar deneyin.',
  webauthn_failed_to_verify: 'Doğrulama başarısız oldu. Lütfen tekrar deneyin.',
};

export default Object.freeze(mfa);
