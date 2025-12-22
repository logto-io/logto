const account_center = {
  header: {
    title: 'Hesap merkezi',
  },
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
    error_failed: 'Doğrulama başarısız. Lütfen parolanı kontrol et.',
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
    resend_countdown: 'Hâlâ gelmedi mi?<span> {{seconds}} sn sonra tekrar gönder.</span>',
  },

  email_verification: {
    title: 'E-postanı doğrula',
    prepare_description:
      'Hesap güvenliğini korumak için kimliğini doğrula. Doğrulama kodunu e-postana gönder.',
    email_label: 'E-posta adresi',
    send: 'Doğrulama kodu gönder',
    description: 'Doğrulama kodu {{email}} adresine gönderildi. Devam etmek için kodu gir.',
    resend: 'Hâlâ gelmedi mi? <a>Doğrulama kodunu yeniden gönder</a>',
    resend_countdown: 'Hâlâ gelmedi mi?<span> {{seconds}} sn sonra tekrar gönder.</span>',
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
    resend_countdown: 'Hâlâ gelmedi mi?<span> {{seconds}} sn sonra tekrar gönder.</span>',
    error_send_failed: 'Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar dene.',
    error_verify_failed: 'Doğrulama başarısız. Lütfen kodu tekrar gir.',
    error_invalid_code: 'Doğrulama kodu geçersiz veya süresi dolmuş.',
  },
  mfa: {
    totp_already_added:
      'Zaten bir authenticator uygulaması eklediniz. Lütfen önce mevcut olanı kaldırın.',
    totp_not_enabled:
      'Authenticator uygulaması etkin değil. Etkinleştirmek için lütfen yöneticinize başvurun.',
    backup_code_already_added:
      'Halihazırda aktif yedek kodlarınız var. Yeni kodlar oluşturmadan önce lütfen bunları kullanın veya kaldırın.',
    backup_code_not_enabled:
      'Yedek kod etkin değil. Etkinleştirmek için lütfen yöneticinize başvurun.',
    backup_code_requires_other_mfa:
      'Yedek kodlar, önce başka bir MFA yönteminin ayarlanmasını gerektirir.',
    passkey_not_enabled: 'Passkey etkin değil. Etkinleştirmek için lütfen yöneticinize başvurun.',
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
    backup_code_deleted: {
      title: 'Yedek kodlar kaldırıldı!',
      description: 'Yedek kodlarınız hesabınızdan kaldırıldı.',
    },
    passkey: {
      title: 'Passkey eklendi!',
      description: 'Passkey başarıyla hesabınıza bağlandı.',
    },
    passkey_deleted: {
      title: 'Passkey kaldırıldı!',
      description: 'Passkey hesabınızdan kaldırıldı.',
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
    delete_confirmation_title: 'Yedek kodlarınızı kaldırın',
    delete_confirmation_description:
      'Bu yedek kodları kaldırırsanız, bunlarla doğrulama yapamayacaksınız.',
  },
  passkey: {
    title: "Passkey'ler",
    added: 'Eklendi: {{date}}',
    last_used: 'Son kullanım: {{date}}',
    never_used: 'Hiç',
    unnamed: 'İsimsiz passkey',
    renamed: 'Passkey başarıyla yeniden adlandırıldı.',
    add_another_title: 'Başka bir passkey ekle',
    add_another_description:
      "Cihaz biyometriği, güvenlik anahtarları (örn. YubiKey) veya diğer mevcut yöntemleri kullanarak passkey'inizi kaydedin.",
    add_passkey: 'Bir passkey ekle',
    delete_confirmation_title: "Passkey'i kaldır",
    delete_confirmation_description:
      '"{{name}}" kaldırmak istediğinizden emin misiniz? Bu passkey ile artık giriş yapamayacaksınız.',
    rename_passkey: "Passkey'i yeniden adlandır",
    rename_description: 'Bu passkey için yeni bir ad girin.',
  },
};

export default Object.freeze(account_center);
