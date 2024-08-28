const connectors = {
  page_title: 'Bağlayıcılar',
  title: 'Bağlayıcılar',
  subtitle:
    'Şifresiz ve sosyal oturum açma deneyimini etkinleştirmek için bağlayıcıları yapılandırın.',
  create: 'Sosyal Bağlayıcı ekle',
  config_sie_notice: 'Bağlayıcıları yapılandırdınız. <a>{{link}}</a> içinde yapılandırmayı yapın.',
  config_sie_link_text: 'oturum açma deneyimi',
  tab_email_sms: 'E-posta ve SMS bağlayıcıları',
  tab_social: 'Sosyal bağlayıcılar',
  connector_name: 'Bağlayıcı adı',
  demo_tip:
    'Bu demo bağlayıcı için izin verilen maksimum mesaj sayısı 100 ile sınırlıdır ve üretim ortamında dağıtılması önerilmez.',
  social_demo_tip:
    'Demo bağlayıcı sadece gösterim amaçlı tasarlanmıştır ve üretim ortamında uygulanması önerilmez.',
  connector_type: 'Tip',
  connector_status: 'Oturum açma deneyimi',
  connector_status_in_use: 'Kullanımda',
  connector_status_not_in_use: 'Kullanımda değil',
  not_in_use_tip: {
    content:
      'Kullanımda değil, oturum açma deneyiminiz bu oturum açma yöntemini kullanmamış demektir. <a>{{link}}</a> bağlantısını kullanarak bu oturum açma yöntemini ekleyin.',
    go_to_sie: 'Oturum açma deneyimine git',
  },
  placeholder_title: 'Sosyal bağlayıcı',
  placeholder_description:
    'Logto, çok sayıda kullanılan sosyal oturum açma bağlayıcısı sağlamıştır. Bu arada, standart protokollerle kendi bağlayıcınızı oluşturabilirsiniz.',
  save_and_done: 'Kaydet ve bitir',
  type: {
    email: 'E-posta bağlayıcısı',
    sms: 'SMS bağlayıcısı',
    social: 'Sosyal bağlayıcı',
  },
  setup_title: {
    email: 'E-posta bağlayıcısı ayarla',
    sms: 'SMS bağlayıcısı ayarla',
    social: 'Sosyal Bağlayıcı ekle',
  },
  guide: {
    subtitle: 'Bağlayıcıyı yapılandırmak için adım adım kılavuz',
    general_setting: 'Genel ayarlar',
    parameter_configuration: 'Parametre konfigürasyonu',
    test_connection: 'Bağlantıyı test et',
    name: 'Sosyal oturum açma düğmesi için ad',
    name_placeholder: 'Sosyal oturum açma düğmesi için ad girin',
    name_tip:
      'Bağlayıcı düğmesinin adı "{{name}} ile devam et" olarak görüntülenecektir. İsimlendirmenin uzunluğuna dikkat edin, çok uzun olursa bir sorun oluşabilir.',
    logo: 'Sosyal oturum açma düğmesi için logo URL',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip:
      'Logo resmi bağlantısı düğmede görüntülenecektir. Herkese açık bir bağlantı alın ve bağlantıyı buraya yapıştırın.',
    logo_dark: 'Sosyal oturum açma düğmesi için logo URL (Karanlık mod)',
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip: 'Karanlık modu etkinleştikten sonra bağlayıcı logonuzu ayarlayın.',
    logo_dark_collapse: 'Daralt',
    logo_dark_show: 'Karanlık mod logu ayarını göster',
    target: 'Kimlik sağlayıcısı adı',
    target_placeholder: 'Bağlayıcı kimlik sağlayıcısı adını girin',
    target_tip:
      '“IdP adı” değeri, sosyal kimliklerinizi ayırt etmek için benzersiz bir tanımlayıcı dize olabilir.',
    target_tip_standard:
      '“IdP adı” değeri, sosyal kimliklerinizi ayırt etmek için benzersiz bir tanımlayıcı dize olabilir. Bu ayar, bağlayıcı oluşturulduktan sonra değiştirilemez.',
    target_tooltip:
      'Logto sosyal bağlayıcılarındaki "Hedef", sosyal kimliklerinizin "kaynağı" na işaret eder. Logto tasarımında, aynı bir platformun "hedef" i kabul edilmez ve çakışmaları önlemek için benzersiz olmalıdır. Bir bağlayıcı eklemeniz gerektiğinde çok dikkatli olmalısınız çünkü oluşturulduktan sonra "hedef" değerini DEĞİŞTİREMEZSİNİZ. <a>Daha fazla bilgi edinin</a>',
    target_conflict:
      'Kullanılan IdP adı, <span>adı</span> ile eşleşmektedir. Aynı idp adını kullanmak, kullanıcıların iki farklı bağlayıcı aracılığıyla aynı hesaba erişebileceği şekilde beklenmeyen oturum açma davranışına neden olabilir.',
    target_conflict_line2:
      'Eski kullanıcıların yeniden kayıt olma olmadan oturum açmasına izin vermek için önceki <span>adı</span> bağlayıcıyı silerek aynı "IdP adı" ile yeni bir bağlayıcı oluşturmak isterseniz yapın.',
    target_conflict_line3:
      'Farklı bir kimlik sağlayıcıya bağlanmak isterseniz, "IdP adı" nı değiştirin ve devam edin.',
    config: "Konfigürasyon JSON'ınızı girin",
    sync_profile: 'Profil bilgisini senkronize et',
    sync_profile_only_at_sign_up: 'Sadece kayıtta senkronize et',
    sync_profile_each_sign_in: 'Her oturum açmada her zaman senkronize et',
    sync_profile_tip:
      'Sosyal sağlayıcıdan temel profil (kullanıcıların adları ve avatarları gibi) senkronize edilsin.',
    callback_uri: 'Geri dönüş URI',
    callback_uri_description:
      "Ayrıca yönlendirme URI'si olarak adlandırılır, kullanıcıların sosyal yetkilendirmeden sonra Logto'ya geri gönderilecekleri URI'dir, ve sosyal sağlayıcının yapılandırma sayfasına kopyalayın yapıştırın.",
    acs_url: 'Assertion consumer service URL',
  },
  platform: {
    universal: 'Evrensel',
    web: 'Web',
    native: 'Native',
  },
  add_multi_platform: ' birden fazla platformu destekler, devam etmek için bir platform seçin',
  drawer_title: 'Bağlayıcı Kılavuzu',
  drawer_subtitle: 'Bağlayıcıyı entegre etmek için yönergeleri izleyin',
  unknown: 'Bilinmeyen bağlayıcı',
  standard_connectors: 'Standart bağlayıcılar',
};

export default Object.freeze(connectors);
