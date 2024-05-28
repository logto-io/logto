const applications = {
  page_title: 'Uygulamalar',
  title: 'Uygulamalar',
  subtitle:
    'Kimlik doğrulaması için Logtoyu kullanmak üzere mobil, tek sayfa, machine to machine veya geleneksel bir uygulama ayarlayınız',
  subtitle_with_app_type: 'Logto Doğrulamasını {{name}} uygulamanız için yapılandırın',
  create: 'Uygulama oluştur',
  create_subtitle_third_party:
    "Logto'yu kimlik sağlayıcısı (IdP) olarak kullanarak üçüncü taraf uygulamalarla kolayca entegre olun",
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
      description: 'Örneğin, iOS uygulaması, Android uygulaması',
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
    third_party: {
      title: 'Üçüncü Taraf Uygulama',
      subtitle: 'Üçüncü taraf bir IdP bağlayıcısı olarak kullanılan bir uygulama',
      description: 'Ör., OIDC, SAML',
    },
  },
  placeholder_title: 'Devam etmek için bir uygulama tipi seçin',
  placeholder_description:
    'Logto, uygulamanızı tanımlamaya, oturum açmayı yönetmeye ve denetim kayıtları oluşturmaya yardımcı olmak için OIDC için bir uygulama varlığı kullanır.',
};

export default Object.freeze(applications);
