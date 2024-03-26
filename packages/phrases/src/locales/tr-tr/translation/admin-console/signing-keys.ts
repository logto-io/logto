const signing_keys = {
  title: 'İmza Anahtarları',
  description:
    'Uygulamalarınız tarafından kullanılan imza anahtarlarını güvenli bir şekilde yönetin.',
  private_key: 'OIDC özel anahtarları',
  private_keys_description: 'OIDC özel anahtarları JWT belgelerini imzalamak için kullanılır.',
  cookie_key: 'OIDC çerez anahtarları',
  cookie_keys_description: 'OIDC çerez anahtarları çerezleri imzalamak için kullanılır.',
  private_keys_in_use: 'Kullanılan özel anahtarlar',
  cookie_keys_in_use: 'Kullanılan çerez anahtarları',
  rotate_private_keys: 'Özel anahtarları döndür',
  rotate_cookie_keys: 'Çerez anahtarlarını döndür',
  rotate_private_keys_description:
    'Bu işlem yeni bir özel imzalama anahtarı oluşturacak, mevcut anahtarı döndürecek ve önceki anahtarınızı kaldıracak. Güncel anahtar ile imzalanmış JWT jetonlarınız silinene veya başka bir döndürme turuna kadar geçerli kalacaktır.',
  rotate_cookie_keys_description:
    'Bu işlem yeni bir çerez anahtarı oluşturacak, mevcut anahtarı döndürecek ve önceki anahtarınızı kaldıracak. Güncel anahtar ile imzalanmış çerezleriniz silinene veya başka bir döndürme turuna kadar geçerli kalacaktır.',
  select_private_key_algorithm: 'Yeni özel anahtar için imzalama anahtar algoritmasını seçin',
  rotate_button: 'Döndür',
  table_column: {
    id: 'Kimlik',
    status: 'Durum',
    algorithm: 'İmzalama anahtar algoritması',
  },
  status: {
    current: 'Geçerli',
    previous: 'Önceki',
  },
  reminder: {
    rotate_private_key:
      '<strong>OIDC özel anahtarlarını</strong> döndürmek istediğinizden emin misiniz? Yeni verilen JWT jetonları yeni anahtarla imzalanacaktır. Var olan JWT jetonları, tekrar döndürünceye kadar geçerli kalacaktır.',
    rotate_cookie_key:
      '<strong>OIDC çerez anahtarlarını</strong> döndürmek istediğinizden emin misiniz? Oturum açma oturumlarında yeni oluşturulan çerezler yeni çerez anahtarıyla imzalanacaktır. Var olan çerezler, tekrar döndürünceye kadar geçerli kalacaktır.',
    delete_private_key:
      '<strong>OIDC özel anahtarını</strong> silmek istediğinizden emin misiniz? Bu özel imzalama anahtarı ile imzalanan mevcut JWT jetonları artık geçerli olmayacaktır.',
    delete_cookie_key:
      '<strong>OIDC çerez anahtarını</strong> silmek istediğinizden emin misiniz? Bu çerez anahtarı ile imzalanan eski oturum açma oturumları artık geçerli olmayacaktır. Bu kullanıcılar için yeniden kimlik doğrulaması gereklidir.',
  },
  messages: {
    rotate_key_success: 'İmzalama anahtarları başarıyla döndü',
    delete_key_success: 'Anahtar başarıyla silindi',
  },
};

export default Object.freeze(signing_keys);
