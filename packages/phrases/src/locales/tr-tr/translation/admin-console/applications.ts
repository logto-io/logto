const applications = {
  page_title: 'Uygulamalar',
  title: 'Uygulamalar',
  subtitle:
    'Kimlik doğrulaması için Logtoyu kullanmak üzere mobil, tek sayfa, machine to machine veya geleneksel bir uygulama ayarlayınız',
  subtitle_with_app_type: 'Logto Doğrulamasını {{name}} uygulamanız için yapılandırın',
  create: 'Uygulama oluştur',
  create_third_party: 'Üçüncü taraf uygulama oluştur',
  create_thrid_party_modal_title: 'Üçüncü taraf uygulaması oluştur ({{type}})',
  application_name: 'Uygulama adı',
  application_name_placeholder: 'Uygulamam',
  application_description: 'Uygulama açıklaması',
  application_description_placeholder: 'Uygulama açıklaması giriniz',
  select_application_type: 'Uygulama tipi seçiniz',
  no_application_type_selected: 'Henüz bir uygulama tipi seçmediniz',
  application_created: 'Uygulama başarıyla oluşturuldu.',
  tab: {
    my_applications: 'Benim uygulamalarım',
    third_party_applications: 'Üçüncü taraf uygulamaları',
  },
  app_id: "Uygulama ID'si",
  type: {
    native: {
      title: 'Yerel Uygulama',
      subtitle: 'Nativede çalışan bir uygulama ',
      description: 'Örneğin, iOS uygulaması, Android uygulaması, masaüstü uygulaması, TV, CLI',
    },
    spa: {
      title: 'Tek Sayfalı Uygulama',
      subtitle:
        'Bir web tarayıcısında çalışan ve verileri yerinde dinamik olarak güncelleyen bir uygulama',
      description: 'Örneğin, React DOM uygulaması, Vue uygulaması',
    },
    traditional: {
      title: 'Geleneksel Web',
      subtitle: 'Sayfaları yalnızca web sunucusu tarafından işleyen ve güncelleyen bir uygulama',
      description: 'Örneğin, JSP, PHP',
    },
    machine_to_machine: {
      title: 'Makine-Makine',
      subtitle: 'Kaynaklarla doğrudan iletişim kuran bir uygulama (genellikle bir servis)',
      description: 'Örneğin, Backend servisi',
    },
    protected: {
      title: 'Korunan Uygulama',
      subtitle: 'Logto tarafından korunan bir uygulama',
      description: 'N/A',
    },
    saml: {
      title: 'SAML Uygulaması',
      subtitle: 'SAML IdP bağlayıcısı olarak kullanılan bir uygulama',
      description: 'Örneğin, SAML',
    },
    third_party: {
      title: 'Üçüncü Taraf Uygulama',
      subtitle: 'Üçüncü taraf bir IdP bağlayıcısı olarak kullanılan bir uygulama',
      description: 'Ör., OIDC, SAML',
    },
  },
  authorization_flow: {
    title: 'Yetkilendirme akışı',
    tooltip: 'Uygulamanız için yetkilendirme akışını seçin. Bir kez ayarlandığında değiştirilemez.',
    authorization_code: {
      title: 'Authorization code',
      description:
        'Varsayılan ve en yaygın yetkilendirme türü. Kullanıcılar, erişimi doğrudan yetkilendirmek için oturum açma sayfasına yönlendirilir.',
    },
    device_flow: {
      title: 'Device flow',
      description:
        "Giriş kısıtlı cihazlar veya arayüzsüz uygulamalar (ör. TV'ler, CLI) için. Kullanıcılar, bir cihaz kodu girerek veya QR kodu tarayarak ayrı bir cihazda oturum açmayı tamamlar.",
    },
  },
  placeholder_title: 'Devam etmek için bir uygulama tipi seçin',
  placeholder_description:
    'Logto, uygulamanızı tanımlamaya, oturum açmayı yönetmeye ve denetim kayıtları oluşturmaya yardımcı olmak için OIDC için bir uygulama varlığı kullanır.',
  third_party_application_placeholder_description:
    'Üçüncü taraf hizmetlere OAuth yetkilendirmesi sağlamak için Logtoyu bir Kimlik Sağlayıcı olarak kullanın. \n Kaynak erişimi için önceden oluşturulmuş bir kullanıcı onay ekranı içerir. <a>Daha fazla bilgi edinin</a>',
  guide: {
    third_party: {
      title: 'Üçüncü taraf uygulamayı entegre et',
      description:
        "Üçüncü taraf hizmetlere OAuth yetkilendirmesi sağlamak için Logto'yu Kimlik Sağlayıcınız olarak kullanın. Güvenli kaynak erişimi için önceden oluşturulmuş bir kullanıcı onay ekranı içerir. <a>Daha fazla bilgi</a>",
    },
  },
};

export default Object.freeze(applications);
