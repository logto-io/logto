const applications = {
  page_title: 'Uygulamalar',
  title: 'Uygulamalar',
  subtitle:
    'Kimlik doğrulaması için Logtoyu kullanmak üzere mobil, tek sayfa, machine to machine veya geleneksel bir uygulama ayarlayınız',
  subtitle_with_app_type: 'Logto Doğrulamasını {{name}} uygulamanız için yapılandırın',
  create: 'Uygulama oluştur',
  application_name: 'Uygulama adı',
  application_name_placeholder: 'Uygulamam',
  application_description: 'Uygulama açıklaması',
  application_description_placeholder: 'Uygulama açıklaması giriniz',
  select_application_type: 'Uygulama tipi seçiniz',
  no_application_type_selected: 'Henüz bir uygulama tipi seçmediniz',
  application_created: 'Uygulaması başarıyla oluşturuldu.',
  app_id: 'App ID',
  type: {
    native: {
      title: 'Native Uygulama',
      subtitle: 'Nativede çalışan bir uygulama ',
      description: 'Örneğin, iOS uygulaması, Android uygulaması',
    },
    spa: {
      title: 'Tek sayfalı uygulama',
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
      title: 'Machine-to-Machine',
      subtitle: 'Kaynaklarla doğrudan iletişim kuran bir uygulama (genellikle bir servis)',
      description: 'Örneğin, Backend servisi',
    },
  },
  guide: {
    header_title: 'Bir çerçeve veya öğretici seçin',
    modal_header_title: 'SDK ve kılavuzlarla başlayın',
    header_subtitle:
      'Önceden oluşturulmuş SDK ve öğreticilerimizle uygulama geliştirme sürecine hız kazandırın.',
    start_building: 'Geliştirmeye Başla',
    categories: {
      featured: 'Popüler ve sizin için',
      Traditional: 'Geleneksel web uygulaması',
      SPA: 'Tek sayfa uygulama',
      Native: 'Native',
      MachineToMachine: 'Machine-to-machine',
    },
    filter: {
      title: 'Çerçeve filtrele',
      placeholder: 'Çerçeve arayın',
    },
    select_a_framework: 'Bir çerçeve seçin',
    checkout_tutorial: '{{name}} öğreticiye göz atın',
    get_sample_file: 'Örnek Gör',
    title: 'Uygulama başarıyla oluşturuldu',
    subtitle:
      'Şimdi uygulama ayarlarınızı tamamlamak için aşağıdaki adımları izleyiniz. Lütfen devam etmek için SDK türünü seçiniz.',
    description_by_sdk:
      'Bu hızlı başlangıç kılavuzu, Logtoyu {{sdk}} uygulamasına nasıl entegre edeceğinizi gösterir',
    do_not_need_tutorial:
      'Bir öğreticiye ihtiyacınız yoksa, çerçeve rehberi olmadan devam edebilirsiniz',
    create_without_framework: 'Çerçevesiz uygulama oluşturma',
    finish_and_done: 'Tamamla ve Bitir',
    cannot_find_guide: 'Rehberinizi bulamıyor musunuz?',
    describe_guide_looking_for: 'Aramakta olduğunuz rehberi açıklayın',
    describe_guide_looking_for_placeholder:
      'Örn., Logtoyu Angular uygulamama entegre etmek istiyorum.',
    request_guide_successfully: 'Talebiniz başarıyla gönderildi. Teşekkür ederiz!',
  },
  placeholder_title: 'Devam etmek için bir uygulama tipi seçin',
  placeholder_description:
    'Logto, uygulamanızı tanımlamaya, oturum açmayı yönetmeye ve denetim kayıtları oluşturmaya yardımcı olmak için OIDC için bir uygulama varlığı kullanır.',
};

export default Object.freeze(applications);
