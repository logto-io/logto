const tenants = {
  title: 'Ayarlar',
  description: 'Kiracı ayarlarını verimli bir şekilde yönetin ve alan adınızı özelleştirin.',
  tabs: {
    settings: 'Ayarlar',
    domains: 'Alan adları',
    subscription: 'Plan ve faturalandırma',
    billing_history: 'Fatura geçmişi',
  },
  settings: {
    title: 'AYARLAR',
    description: 'Kiracı adını ayarlayın ve barındırılan veri bölgenizi görüntüleyin.',
    tenant_id: 'Kiracı Kimliği',
    tenant_name: 'Kiracı Adı',
    tenant_region: 'Veriler barındırılan bölge',
    tenant_region_tip:
      'Kiracı kaynaklarınız {{region}} bölgesinde barındırılır. <a>Daha fazla bilgi</a>',
    environment_tag_development: 'Geliş',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_type: 'Kiracı türü',
    development_description:
      'Yalnızca testlerde kullanılır ve üretimde kullanılmamalıdır. Abonelik gerekmez.',
    production_description:
      'Son kullanıcılar tarafından kullanılan uygulamalar için tasarlanmış olup ücretli bir aboneliğe ihtiyaç duyabilir.',
    tenant_info_saved: 'Kiracı bilgileri başarıyla kaydedildi.',
  },
  full_env_tag: {
    development: 'Geliştirme',
    production: 'Prod',
  },
  deletion_card: {
    title: 'SİL',
    tenant_deletion: 'Kiracıyı Sil',
    tenant_deletion_description:
      'Kiracının silinmesi, tüm ilişkili kullanıcı verilerinin ve yapılandırmalarının kalıcı olarak silinmesine neden olur. Lütfen dikkatli bir şekilde devam edin.',
    tenant_deletion_button: 'Kiracıyı Sil',
  },
  create_modal: {
    title: 'Kiracı Oluştur',
    subtitle:
      'İzole kaynaklara ve kullanıcılara sahip yeni bir kiracı oluşturun. Verilerin barındırıldığı bölge ve kiracı türleri oluşturulduktan sonra değiştirilemez.',
    development_description:
      'Yalnızca testlerde kullanılır ve üretimde kullanılmamalıdır. Abonelik gerekmez.',
    development_hint:
      'Tüm pro özelliklere sahiptir ancak oturum açma banner gibi bazı kısıtlamalara sahiptir.',
    production_description:
      'Son kullanıcılar tarafından kullanılmak üzere tasarlanmıştır ve ücretli bir aboneliğe ihtiyaç duyabilir.',
    available_plan: 'Mevcut plan:',
    create_button: 'Kiracı oluştur',
    tenant_name_placeholder: 'Benim kiracım',
  },
  dev_tenant_migration: {
    title:
      'Yeni "Geliştirme kiracısı" oluşturarak Hobby ve Pro özelliklerimizi ücretsiz deneyebilirsiniz!',
    affect_title: 'Bu size nasıl etki eder?',
    hint_1:
      'Eski <strong>ortam etiketlerini</strong> iki yeni kiracı türüyle: <strong>“Geliş”</strong> ve <strong>“Prod”</strong> değiştiriyoruz.',
    hint_2:
      'Sorunsuz bir geçiş ve kesintisiz işlevsellik için, tüm önceden oluşturulmuş kiracılarınız önceki abonelikleri ile birlikte <strong>Prod</strong> kiracı tipine yükseltilecektir.',
    hint_3: 'Endişelenmeyin, diğer tüm ayarlarınız aynı kalır.',
    about_tenant_type: 'Kiracı türü hakkında',
  },
  dev_tenant_notification: {
    title:
      'Artık geliştirme kiracınızda <a>Logto Hobby ve Pro tüm özelliklerine</a> erişebilirsiniz!',
    description: 'Bu tamamen ücretsizdir ve deneme süresi olmaksızın sürekli geçerlidir!',
  },
  delete_modal: {
    title: 'Kiracıyı Sil',
    description_line1:
      'Ortam etiketi "{{tag}}" olan "{{name}}" kiracınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm verilerinizin ve hesap bilgilerinizin kalıcı olarak silinmesine neden olur.',
    description_line2:
      'Hesabınızı silmeden önce size yardımcı olabiliriz. <span><a>E-posta yoluyla bize ulaşın</a></span>',
    description_line3: 'Devam etmek isterseniz, "{{name}}" kiracı adını onaylamak için yazın.',
    delete_button: 'Kalıcı olarak sil',
    cannot_delete_title: 'Bu kiracı silinemez',
    cannot_delete_description:
      'Üzgünüm, bu kiracıyı şu anda silemezsiniz. Ücretsiz Plan üzerinde olduğunuzdan ve tüm ödenmemiş faturaları ödediğinizden emin olun.',
  },
  tenant_landing_page: {
    title: 'Henüz bir kiracı oluşturmadınız',
    description:
      'Logto ile projenizi yapılandırmaya başlamak için lütfen yeni bir kiracı oluşturun. Hesabınızdan çıkış yapmanız veya hesabınızı silmeniz gerekiyorsa, sağ üst köşedeki avatar düğmesine tıklayın.',
    create_tenant_button: 'Kiracı oluştur',
  },
  status: {
    mau_exceeded: 'MAU Sınırı Aşıldı',
    suspended: 'Askıya Alındı',
    overdue: 'Geçmişte',
  },
  tenant_suspended_page: {
    title: 'Kiracı Askıya Alındı. Erişimi geri yüklemek için bizimle iletişime geçin.',
    description_1:
      'Üzülerek bildirmekten üzüntü duyuyoruz, kiracı hesabınız şu anda geçici olarak askıya alınmıştır. Bunun nedeni, MAU sınırlarını aşmak, gecikmiş ödemeler veya diğer izinsiz işlemler gibi yanlış kullanımdır.',
    description_2:
      'Daha fazla açıklama, endişeleriniz veya işlevselliği tamamen geri yüklemek ve kiracılarınızı engellemek isterseniz, lütfen derhal bizimle iletişime geçmekten çekinmeyin.',
  },
  signing_keys: {
    title: 'İMZALAMA ANAHTARLARI',
    description: 'Kiracınızda imzalama anahtarlarını güvenli bir şekilde yönetin.',
    type: {
      private_key: 'OIDC özel anahtarları',
      cookie_key: 'OIDC çerez anahtarları',
    },
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
  },
};

export default Object.freeze(tenants);
