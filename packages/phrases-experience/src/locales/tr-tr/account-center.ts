const account_center = {
  home: {
    title: 'Sayfa bulunamadı',
    description: 'Bu sayfa kullanılamıyor.',
  },
  verification: {
    title: 'Güvenlik doğrulaması',
    description:
      'Hesap güvenliğinizi korumak için siz olduğunuzu doğrulayın. Kimliğinizi doğrulamak için lütfen yöntemi seçin.',
    error_send_failed: 'Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar dene.',
    error_invalid_code: 'Doğrulama kodu geçersiz veya süresi dolmuş.',
    error_verify_failed: 'Doğrulama başarısız. Lütfen kodu tekrar gir.',
    verification_required: 'Doğrulama süresi doldu. Lütfen kimliğini yeniden doğrula.',
    try_another_method: 'Başka bir doğrulama yöntemi deneyin',
  },
  password_verification: {
    title: 'Parolayı doğrula',
    description: 'Hesabını korumak için kimliğini doğrula. Parolanı gir.',
    error_failed: 'Yanlış parola. Lütfen girişinizi kontrol edin.',
  },
  verification_method: {
    password: {
      name: 'Parola',
      description: 'Parolanızı doğrulayın',
    },
    email: {
      name: 'E-posta doğrulama kodu',
      description: 'Doğrulama kodunu e-postana gönder',
    },
    phone: {
      name: 'Telefon doğrulama kodu',
      description: 'Doğrulama kodunu telefon numarana gönder',
    },
  },
  email: {
    title: 'E-postayı bağla',
    description: 'Giriş yapmak veya hesap kurtarmaya yardımcı olmak için e-postanı bağla.',
    verification_title: 'E-posta doğrulama kodunu gir',
    verification_description: 'Doğrulama kodu e-postana {{email_address}} gönderildi.',
    success: 'Birincil e-posta başarıyla bağlandı.',
    verification_required: 'Doğrulama süresi doldu. Lütfen kimliğini yeniden doğrula.',
  },
  phone: {
    title: 'Telefon numarasını bağla',
    description: 'Giriş yapmak veya hesap kurtarmaya yardımcı olmak için telefon numaranı bağla.',
    verification_title: 'SMS doğrulama kodunu gir',
    verification_description: 'Doğrulama kodu telefonuna {{phone_number}} gönderildi.',
    success: 'Birincil telefon başarıyla bağlandı.',
    verification_required: 'Doğrulama süresi doldu. Lütfen kimliğini yeniden doğrula.',
  },
  username: {
    title: 'Kullanıcı adını ayarla',
    description: 'Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir.',
    success: 'Kullanıcı adı başarıyla güncellendi.',
  },
  password: {
    title: 'Şifreyi ayarla',
    description: 'Hesabını korumak için yeni bir şifre oluştur.',
    success: 'Şifre başarıyla güncellendi.',
  },
  code_verification: {
    send: 'Doğrulama kodu gönder',
    resend: 'Hâlâ gelmedi mi? <a>Doğrulama kodunu yeniden gönder</a>',
    resend_countdown: 'Hâlâ gelmedi mi? {{seconds}} sn sonra tekrar gönder.',
  },
  email_verification: {
    title: 'E-postanı doğrula',
    prepare_description:
      'Hesap güvenliğini korumak için kimliğini doğrula. Doğrulama kodunu e-postana gönder.',
    email_label: 'E-posta adresi',
    send: 'Doğrulama kodu gönder',
    description: 'Doğrulama kodu {{email}} adresine gönderildi. Devam etmek için kodu gir.',
    resend: 'Hâlâ gelmedi mi? <a>Doğrulama kodunu yeniden gönder</a>',
    not_received: 'Hâlâ gelmedi mi?',
    resend_action: 'Doğrulama kodunu yeniden gönder',
    resend_countdown: 'Hâlâ gelmedi mi? {{seconds}} sn sonra tekrar gönder.',
    error_send_failed: 'Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar dene.',
    error_verify_failed: 'Doğrulama başarısız. Lütfen kodu tekrar gir.',
    error_invalid_code: 'Doğrulama kodu geçersiz veya süresi dolmuş.',
  },
  phone_verification: {
    title: 'Telefonunu doğrula',
    prepare_description:
      'Hesap güvenliğinizi korumak için siz olduğunuzu doğrulayın. Doğrulama kodunu telefonuna gönder.',
    phone_label: 'Telefon numarası',
    send: 'Doğrulama kodu gönder',
    description: 'Doğrulama kodu telefonuna {{phone}} gönderildi. Devam etmek için kodu gir.',
    resend: 'Hâlâ gelmedi mi? <a>Doğrulama kodunu yeniden gönder</a>',
    resend_countdown: 'Hâlâ gelmedi mi? {{seconds}} sn sonra tekrar gönder.',
    error_send_failed: 'Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar dene.',
    error_verify_failed: 'Doğrulama başarısız. Lütfen kodu tekrar gir.',
    error_invalid_code: 'Doğrulama kodu geçersiz veya süresi dolmuş.',
  },
  mfa: {
    totp_already_added:
      'Zaten bir authenticator uygulaması eklediniz. Lütfen önce mevcut olanı kaldırın.',
    totp_not_enabled:
      'Authenticator uygulaması OTP etkin değil. Yardım için lütfen yöneticinizle iletişime geçin.',
    backup_code_already_added:
      'Halihazırda aktif yedek kodlarınız var. Yeni kodlar oluşturmadan önce lütfen bunları kullanın veya kaldırın.',
    backup_code_not_enabled:
      'Yedek kod etkin değil. Yardım için lütfen yöneticinizle iletişime geçin.',
    backup_code_requires_other_mfa:
      'Yedek kodlar, önce başka bir MFA yönteminin ayarlanmasını gerektirir.',
    passkey_not_enabled: 'Passkey etkin değil. Yardım için lütfen yöneticinizle iletişime geçin.',
    passkey_already_registered:
      'Bu passkey zaten hesabınıza kayıtlı. Lütfen farklı bir kimlik doğrulayıcı kullanın.',
  },
  update_success: {
    default: {
      title: 'Güncellendi!',
      description: 'Bilgileriniz güncellendi.',
    },
    email: {
      title: 'E-posta güncellendi!',
      description: 'E-posta adresiniz başarıyla güncellendi.',
    },
    phone: {
      title: 'Telefon numarası güncellendi!',
      description: 'Telefon numaranız başarıyla güncellendi.',
    },
    username: {
      title: 'Kullanıcı adı değiştirildi!',
      description: 'Kullanıcı adınız başarıyla güncellendi.',
    },
    password: {
      title: 'Şifre değiştirildi!',
      description: 'Şifreniz başarıyla güncellendi.',
    },
    totp: {
      title: 'Authenticator uygulaması eklendi!',
      description: 'Authenticator uygulamanız hesabınıza başarıyla bağlandı.',
    },
    backup_code: {
      title: 'Yedek kodlar oluşturuldu!',
      description: 'Yedek kodlarınız kaydedildi. Onları güvenli bir yerde saklayın.',
    },
    passkey: {
      title: 'Passkey eklendi!',
      description: 'Passkey başarıyla hesabınıza bağlandı.',
    },
    social: {
      title: 'Sosyal hesap bağlandı!',
      description: 'Sosyal hesabınız başarıyla bağlandı.',
    },
  },
  backup_code: {
    title: 'Yedek kodlar',
    description:
      '2 adımlı doğrulamada başka yollarla sorun yaşarsanız hesabınıza erişmek için bu yedek kodlardan birini kullanabilirsiniz. Her kod yalnızca bir kez kullanılabilir.',
    copy_hint: 'Kopyalayıp güvenli bir yerde sakladığınızdan emin olun.',
    generate_new_title: 'Yeni yedek kodlar oluştur',
    generate_new: 'Yeni yedek kodlar oluştur',
  },
  passkey: {
    title: "Passkey'ler",
    added: 'Eklendi: {{date}}',
    last_used: 'Son kullanım: {{date}}',
    never_used: 'Hiç',
    unnamed: 'İsimsiz passkey',
    renamed: 'Passkey başarıyla yeniden adlandırıldı.',
    deleted: 'Passkey başarıyla kaldırıldı.',
    add_another_title: 'Başka bir passkey ekle',
    add_another_description:
      "Cihaz biyometriği, güvenlik anahtarları (örn. YubiKey) veya diğer mevcut yöntemleri kullanarak passkey'inizi kaydedin.",
    add_passkey: 'Bir passkey ekle',
    delete_confirmation_title: "Passkey'inizi kaldırın",
    delete_confirmation_description:
      "Bu passkey'i kaldırırsanız, onunla doğrulama yapamayacaksınız.",
    rename_passkey: "Passkey'i yeniden adlandır",
    rename_description: 'Bu passkey için yeni bir ad girin.',
    name_this_passkey: "Bu cihaz passkey'ini adlandır",
    name_passkey_description:
      'Bu cihazı 2 adımlı kimlik doğrulama için başarıyla doğruladınız. Birden fazla anahtarınız varsa tanımak için adı özelleştirin.',
    name_input_label: 'Ad',
  },
};

export default Object.freeze(account_center);
