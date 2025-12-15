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
    title: 'Telefonu bağla',
    description: 'Giriş yapmak veya hesap kurtarmaya yardımcı olmak için telefon numaranı bağla.',
    verification_title: 'Telefon doğrulama kodunu gir',
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
    resend: 'Kodu yeniden gönder',
    resend_countdown: 'Hâlâ gelmedi mi? {{seconds}} sn sonra tekrar gönder.',
  },

  email_verification: {
    title: 'E-postanı doğrula',
    prepare_description:
      'Hesap güvenliğini korumak için kimliğini doğrula. Doğrulama kodunu e-postana gönder.',
    email_label: 'E-posta adresi',
    send: 'Doğrulama kodu gönder',
    description: 'Doğrulama kodu {{email}} adresine gönderildi. Devam etmek için kodu gir.',
    resend: 'Kodu yeniden gönder',
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
    resend: 'Kodu yeniden gönder',
    resend_countdown: 'Hâlâ gelmedi mi? {{seconds}} sn sonra tekrar gönder.',
    error_send_failed: 'Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar dene.',
    error_verify_failed: 'Doğrulama başarısız. Lütfen kodu tekrar gir.',
    error_invalid_code: 'Doğrulama kodu geçersiz veya süresi dolmuş.',
  },
  mfa: {
    totp_already_added:
      'Zaten bir doğrulayıcı uygulama eklediniz. Lütfen önce mevcut olanı kaldırın.',
    totp_not_enabled:
      'Doğrulayıcı uygulama etkin değil. Lütfen etkinleştirmek için yöneticinizle iletişime geçin.',
  },
  update_success: {
    default: {
      title: 'Güncelleme başarılı',
      description: 'Değişiklikleriniz başarıyla kaydedildi.',
    },
    email: {
      title: 'E-posta adresi güncellendi!',
      description: 'Hesabınızın e-posta adresi başarıyla değiştirildi.',
    },
    phone: {
      title: 'Telefon numarası güncellendi!',
      description: 'Hesabınızın telefon numarası başarıyla değiştirildi.',
    },
    username: {
      title: 'Kullanıcı adı güncellendi!',
      description: 'Hesabının kullanıcı adı başarıyla değiştirildi.',
    },

    password: {
      title: 'Şifre güncellendi!',
      description: 'Hesabının şifresi başarıyla değiştirildi.',
    },
    totp: {
      title: 'Doğrulayıcı uygulama eklendi!',
      description: 'Doğrulayıcı uygulamanız hesabınıza başarıyla bağlandı.',
    },
  },
};

export default Object.freeze(account_center);
