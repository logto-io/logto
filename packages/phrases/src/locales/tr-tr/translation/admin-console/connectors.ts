const connectors = {
  page_title: 'Connectorlar',
  title: 'Connectorlar',
  subtitle:
    'Şifresiz ve sosyal oturum açma deneyimini etkinleştirmek için connectorları ayarlayınız.',
  create: 'Sosyal Connector ekle',
  config_sie_notice: 'Connectorları ayarladınız. <a>{{link}}</a> içinde yapılandırmayı yapın.',
  config_sie_link_text: 'oturum açma deneyimi',
  tab_email_sms: 'E-posta ve SMS connectorları',
  tab_social: 'Sosyal connectorlar',
  connector_name: 'Connector adı',
  demo_tip:
    'Bu demo connector için izin verilen maksimum mesaj sayısı 100 ile sınırlıdır ve üretim ortamında dağıtılması önerilmez.',
  social_demo_tip:
    'Demo connector sadece gösterim amaçlı tasarlanmıştır ve üretim ortamında uygulanması önerilmez.',
  connector_type: 'Tip',
  connector_status: 'Oturum açma deneyimi',
  connector_status_in_use: 'Kullanımda',
  connector_status_not_in_use: 'Kullanımda değil',
  not_in_use_tip: {
    content:
      'Kullanımda değil, oturum açma deneyiminiz bu oturum açma yöntemini kullanmamış demektir. <a>{{link}}</a> bağlantısını kullanarak bu oturum açma yöntemini ekleyin.',
    go_to_sie: 'Oturum açma deneyimine git',
  },
  placeholder_title: 'Sosyal connector',
  placeholder_description:
    'Logto, çok sayıda kullanılan sosyal oturum açma connectorı sağlamıştır. Bu arada, standart protokollerle kendi connectorınızı oluşturabilirsiniz.',
  save_and_done: 'Kaydet ve bitir',
  type: {
    email: 'Eposta connectorı',
    sms: 'SMS connectorı',
    social: 'Sosyal connector',
  },
  setup_title: {
    email: 'E-posta connectorı ayarla',
    sms: 'SMS connectorı ayarla',
    social: 'Sosyal Connector ekle',
  },
  guide: {
    subtitle: 'Connectorı yapılandırmak için adım adım kılavuz',
    general_setting: 'Genel ayarlar',
    parameter_configuration: 'Parametre konfigürasyonu',
    test_connection: 'Bağlantıyı test et',
    name: 'Sosyal oturum açma düğmesi için ad',
    name_placeholder: 'Sosyal oturum açma düğmesi için ad girin',
    name_tip:
      'Connector düğmesinin adı "{{name}} ile devam et" olarak görüntülenecektir. İsimlendirmenin uzunluğuna dikkat edin, çok uzun olursa bir sorun oluşabilir.',
    logo: 'Sosyal oturum açma düğmesi için logo URL',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip:
      'Logo resmi bağlantısı düğmede görüntülenecektir. Herkese açık bir bağlantı alın ve bağlantıyı buraya yapıştırın.',
    logo_dark: 'Sosyal oturum açma düğmesi için logo URL (Karanlık mod)',
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip: 'Karanlık modu etkinleştirdikten sonra connector logonuzu ayarlayın.',
    logo_dark_collapse: 'Daralt',
    logo_dark_show: 'Karanlık mod logu ayarını göster',
    target: 'Kimlik sağlayıcısı adı',
    target_placeholder: 'Connector kimlik sağlayıcısı adını girin',
    target_tip:
      '“IdP adı” değeri, sosyal kimliklerinizi ayırt etmek için benzersiz bir tanımlayıcı dize olabilir.',
    target_tip_standard:
      '“IdP adı” değeri, sosyal kimliklerinizi ayırt etmek için benzersiz bir tanımlayıcı dize olabilir. Bu ayar, connector oluşturulduktan sonra değiştirilemez.',
    target_tooltip:
      'Logto sosyal connectorlarındaki "Hedef", sosyal kimliklerinizin "kaynağı" na işaret eder. Logto tasarımında, aynı bir platformun "hedef" i kabul edilmez ve çakışmaları önlemek için benzersiz olmalıdır. Bir connector eklemeniz gerektiğinde çok dikkatli olmalısınız çünkü oluşturulduktan sonra "hedef" değerini DEĞİŞTİREMEZSİNİZ. <a>Daha fazla bilgi edinin.</a>',
    target_conflict:
      'Kullanılan IdP adı, <span>adı</span> ile eşleşmektedir. Aynı idp adını kullanmak, kullanıcıların iki farklı connector aracılığıyla aynı hesaba erişebileceği şekilde beklenmeyen oturum açma davranışına neden olabilir.',
    target_conflict_line2:
      'Eski kullanıcıların yeniden kayıt olma olmadan oturum açmasına izin vermek için önceki <span>adı</span> connectorını silerek aynı "IdP adı" ile yeni bir connector oluşturmak isterseniz yapın.',
    target_conflict_line3:
      'Farklı bir kimlik sağlayıcıya bağlanmak isterseniz, "IdP adı" nı değiştirin ve devam edin.',
    config: "Konfigürasyon JSON'ınızı girin",
    sync_profile: 'Profil bilgisini senkronize et',
    sync_profile_only_at_sign_up: 'Sadece kayıtta senkronize et',
    sync_profile_each_sign_in: 'Her oturum açma da her zaman senkronize et',
    sync_profile_tip:
      'Sosyal sağlayıcıdan temel profil (kullanıcıların adları ve avatarları gibi) senkronize edilsin.',
    callback_uri: 'Geri dönüş URI',
    callback_uri_description:
      "Ayrıca yönlendirme URI'si olarak adlandırılır, kullanıcıların sosyal yetkilendirmeden sonra Logto'ya geri gönderilecekleri URI'dir, ve sosyal sağlayıcının yapılandırma sayfasına kopyalayın yapıştırın.",
  },
  platform: {
    universal: 'Evrensel',
    web: 'Web',
    native: 'Native',
  },
  add_multi_platform: ' birden fazla platformu destekler, devam etmek için bir platform seçin',
  drawer_title: 'Connector Kılavuzu',
  drawer_subtitle: 'Connectorı entegre etmek için yönergeleri izleyin',
  unknown: 'Bilinmeyen connector',
};

export default connectors;
