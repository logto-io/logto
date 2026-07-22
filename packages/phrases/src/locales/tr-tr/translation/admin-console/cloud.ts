const cloud = {
  general: {
    onboarding: 'Başlatma',
  },
  create_tenant: {
    page_title: 'Kiracı oluştur',
    title: 'İlk kiracınızı oluşturun',
    description:
      'Bir kiracı, kullanıcı kimliklerini, uygulamaları ve diğer tüm Logto kaynaklarını yönetebileceğiniz izole bir ortamdır.',
    invite_collaborators: 'E-posta ile işbirlikçilerinizi davet edin',
    hear_about_us: {
      title: "Logto'yu ilk nereden duydunuz?",
      detail_placeholder: 'Bize daha fazla anlatın (isteğe bağlı)',
      options: {
        search_engine: 'Arama motoru (Google, Bing...)',
        ai_assistant: 'Yapay zeka asistanı (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub veya açık kaynak dizinleri',
        friend_colleague: 'Bir arkadaş veya iş arkadaşı',
        powered_by: 'Logto kullanan bir uygulamanın oturum açma sayfası',
        content_social: 'Sosyal medya, makale veya video (YouTube, X, Reddit...)',
        other: 'Diğer',
      },
    },
  },
  social_callback: {
    title: 'Başarıyla giriş yaptınız',
    description:
      "Sosyal hesabınızı kullanarak başarılı bir şekilde giriş yaptınız. Logto'nun tüm özelliklerine sorunsuz entegrasyon ve erişim sağlamak için kendi sosyal konektörünüzü yapılandırmaya devam etmenizi öneririz.",
    notice:
      'Demo konektörünü üretim amaçlı kullanmaktan kaçının. Testlerinizi tamamladıktan sonra, lütfen demo konektörünü silin ve kimlik bilgilerinizle kendi konektörünüzü kurun.',
  },
  tenant: {
    create_tenant: 'Kiracı Oluştur',
  },
};

export default Object.freeze(cloud);
