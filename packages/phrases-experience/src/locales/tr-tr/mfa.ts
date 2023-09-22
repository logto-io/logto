const mfa = {
  totp: 'Kimlik doğrulama uygulaması OTP',
  webauthn: 'Anahtar kodu',
  backup_code: 'Yedek kodu',
  link_totp_description: 'Google Authenticator vb. Bağlayın',
  link_webauthn_description: 'Cihazınızı veya USB donanımınızı bağlayın',
  link_backup_code_description: 'Yedek kodu oluşturun',
  verify_totp_description: 'Uygulamadaki tek kullanımlık kodu girin',
  verify_webauthn_description: 'Cihazınızı veya USB donanımınızı doğrulayın',
  verify_backup_code_description: 'Kaydettiğiniz yedek kodu yapıştırın',
  add_mfa_factors: '2 adımlı kimlik doğrulama ekleyin',
  add_mfa_description:
    'İki faktörlü kimlik doğrulama etkinleştirildi. Güvenli hesap oturumu açma için ikinci doğrulama yönteminizi seçin.',
  verify_mfa_factors: '2 adımlı kimlik doğrulama',
  verify_mfa_description:
    'Bu hesap için iki faktörlü kimlik doğrulama etkinleştirildi. Lütfen kimliğinizi doğrulamanın ikinci yolunu seçin.',
  add_authenticator_app: 'Kimlik doğrulama uygulaması ekleyin',
  step: 'Adım {{step, number}}: {{content}}',
  scan_qr_code: 'Bu QR kodunu tarayın',
  scan_qr_code_description:
    'Google Authenticator, Duo Mobile, Authy vb. gibi kimlik doğrulama uygulamanızı kullanarak bu QR kodunu tarayın.',
  qr_code_not_available: 'QR kodunu tarayamıyor musunuz?',
  copy_and_paste_key: 'Anahtarı kopyala ve yapıştır',
  copy_and_paste_key_description:
    'Aşağıdaki anahtarı Google Authenticator, Duo Mobile, Authy vb. gibi kimlik doğrulama uygulamanıza yapıştırın.',
  want_to_scan_qr_code: 'QR kodunu tarımak istiyor musunuz?',
  enter_one_time_code: 'Tek kullanımlık kodu girin',
  enter_one_time_code_link_description:
    'Kimlik doğrulama uygulaması tarafından oluşturulan 6 haneli doğrulama kodunu girin.',
  enter_one_time_code_description:
    'Bu hesap için iki faktörlü kimlik doğrulama etkinleştirildi. Lütfen bağlı kimlik doğrulama uygulamanızda gördüğünüz tek kullanımlık kodu girin.',
  link_another_mfa_factor: 'Başka bir 2 adımlı kimlik doğrulama bağlayın',
  save_backup_code: 'Yedek kodunuzu kaydedin',
  save_backup_code_description:
    'Başka bir şekilde iki faktörlü kimlik doğrulama sırasında sorun yaşarsanız bu yedek kodlardan birini kullanabilirsiniz. Her kod yalnızca bir kez kullanılabilir.',
  backup_code_hint: 'Onları kopyalayıp güvenli bir yerde sakladığınızdan emin olun.',
  enter_backup_code_description:
    'İki faktörlü kimlik doğrulama ilk etkinleştirildiğinde kaydettiğiniz yedek kodu girin.',
  create_a_passkey: 'Bir anahtar kodu oluşturun',
  create_passkey_description:
    'Cihazınızın şifresi veya biyometrisi, QR kodunu tarayarak veya YubiKey gibi bir USB güvenlik anahtarı kullanarak doğrulamak için bir anahtar kodu kaydedin.',
  name_your_passkey: 'Anahtar kodunuza bir ad verin',
  name_passkey_description:
    'Bu cihazı başarıyla iki faktörlü kimlik doğrulama için doğruladınız. Birden fazla anahtarınız varsa tanımak için bir ad özelleştirin.',
  try_another_verification_method: 'Başka bir doğrulama yöntemi deneyin',
  verify_via_passkey: 'Anahtar kodu ile doğrulama',
  verify_via_passkey_description:
    'Cihazınızın şifresi veya biyometrisi, QR kodunu tarayarak veya YubiKey gibi bir USB güvenlik anahtarı kullanarak doğrulama için anahtar kodunu kullanın.',
  secret_key_copied: 'Gizli anahtar kopyalandı.',
  backup_code_copied: 'Yedek kodu kopyalandı.',
};

export default Object.freeze(mfa);
