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
  },
};

export default Object.freeze(account_center);
