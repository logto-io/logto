const cloud = {
  console_sso: {
    back_to_list: "Console SSO'ya dön",
    create: 'Bağlayıcı ekle',
    title: 'Konsol SSO',
    description:
      'Logto Console’da tek oturum açma ile oturum açmak için kendi kimlik sağlayıcınızı yapılandırın.',
    domain_bound: 'Bağlandı',
    domain_pending: 'Doğrulanıyor',
    domain_verify_step: 'Alan adınızı doğrulayın',
    domain_bind_step: 'E-posta alan adını bağla',
    domain_add_placeholder: 'E-posta alan adı ekle',
    domain_bound_description: 'Bu alan adı Console SSO için etkin. TXT doğrulama kaydı kaldırıldı.',
    domain_dns_instructions:
      'Alan adı sahipliğini doğrulamak için bu TXT kaydını DNS sağlayıcınıza ekleyin.',
    domain_waiting_for_dns: 'TXT kaydı bekleniyor. Her 10 saniyede bir yeniden kontrol ediyoruz.',
    domain_proven_unbound: 'Alan adı sahipliği doğrulandı ancak bağlama tamamlanmadı.',
    domain_verified: 'Alan adı sahipliği doğrulandı.',
    domain_binding_pending: 'Bağlama işlemi doğrulamadan sonra otomatik olarak başlar.',
    domain_remove_description:
      '{{domain}} Console SSO üzerinden kaldırılsın mı? Bağlı bir alan adının kaldırılması, e-posta adresleri için SSO keşfini durdurur.',
    domain_invalid: 'Geçerli bir e-posta alan adı girin.',
    domain_conflict: 'Bu alan adı başka bir Console SSO bağlayıcısına zaten bağlı.',
    domain_invalid_provider: 'Bu alan adını bağlamadan önce Bağlantı ayarlarını tamamlayın.',
    domain_dns_timeout: 'DNS kontrolü başarısız oldu. Otomatik olarak yeniden deneyeceğiz.',
    domain_recovery: 'Alan adı değişikliği tamamlanmadı.',
    start_over: 'Yeniden başla',
    start_over_confirmation:
      'Baştan başlamak, tamamlanmamış SSO yapılandırmanızı silebilir. Devam etmek istiyor musunuz?',
    resume_creation:
      'Tamamlanmamış bir oluşturma işlemi bulundu. Bu bağlayıcıyı kurtarmak için aynı sağlayıcıyla devam edin.',
  },
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
