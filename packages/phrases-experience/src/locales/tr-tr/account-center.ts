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
  },
  password_verification: {
    title: 'Verify password',
    description: "Verify it's you to protect your account security. Enter your password.",
    error_failed: 'Verification failed. Please check your password.',
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
    success: 'Primary email linked successfully.',
    verification_required: 'Verification expired. Please verify your identity again.',
  },
  email_verification: {
    title: 'E-postanı doğrula',
    prepare_description:
      "Verify it's you to protect your account security. Send the verification code to your email.",
    email_label: 'Email address',
    send: 'Send verification code',
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
    send: 'Send verification code',
    description: 'Doğrulama kodu telefonuna {{phone}} gönderildi. Devam etmek için kodu gir.',
    resend: 'Kodu yeniden gönder',
    resend_countdown: 'Hâlâ gelmedi mi? {{seconds}} sn sonra tekrar gönder.',
    error_send_failed: 'Doğrulama kodu gönderilemedi. Lütfen daha sonra tekrar dene.',
    error_verify_failed: 'Doğrulama başarısız. Lütfen kodu tekrar gir.',
    error_invalid_code: 'Doğrulama kodu geçersiz veya süresi dolmuş.',
  },
};

export default Object.freeze(account_center);
