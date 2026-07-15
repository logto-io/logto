const inline_hooks = {
  page_title: 'Satır içi kancalar',
  title: 'Satır içi kancalar',
  subtitle:
    'Logto davranışını genişletmek için kimlik doğrulama akışının belirli noktalarında özel kod çalıştırın.',
  status: {
    not_configured: 'Yapılandırılmadı',
    configured: 'Yapılandırıldı',
    enabled: 'Etkin',
    disabled: 'Devre dışı',
  },
  hooks: {
    post_first_factor_verification: {
      name: 'İlk faktör doğrulamasından sonra',
      description:
        'İlk kimlik doğrulama faktörü doğrulandıktan sonra ve oturum açma devam etmeden önce özel mantık çalıştırın.',
    },
    post_sign_in: {
      name: 'Oturum açma sonrası',
      description: 'Bir kullanıcı başarıyla oturum açtıktan sonra özel mantık çalıştırın.',
    },
  },
};

export default Object.freeze(inline_hooks);
