const cloud = {
  welcome: {
    page_title: 'Hoşgeldiniz',
    title: 'Hoşgeldiniz ve kendi Logto Cloud Önizlemenizi oluşturalım',
    description:
      "Açık kaynak veya bulut kullanıcısı olsanız da, sergi turuna çıkın ve Logto'nun tam değerini deneyimleyin. Cloud önizlemesi ayrıca Logto Cloud'un ön sürümü olarak da hizmet verir.",
    project_field: "Logto'yu kullanıyorum çünkü",
    project_options: {
      personal: 'Kişisel proje',
      company: 'Şirket projesi',
    },
    deployment_type_field: 'Açık kaynak veya bulut tercih eder misiniz?',
    deployment_type_options: {
      open_source: 'Açık Kaynak',
      cloud: 'Bulut',
    },
  },
  about: {
    page_title: 'Biraz sen hakkında',
    title: 'Senin hakkında biraz bilgi',
    description:
      'Sizi daha iyi tanıyarak Logto deneyiminizi size özel hale getirelim. Bilgileriniz bizimle güvende.',
    title_field: 'Unvanın',
    title_options: {
      developer: 'Geliştirici',
      team_lead: 'Takım Lideri',
      ceo: 'CEO',
      cto: 'CTO',
      product: 'Ürün',
      others: 'Diğerleri',
    },
    company_name_field: 'Şirket adı',
    company_name_placeholder: 'Acme.co',
    company_size_field: 'Şirketinizin boyutu nasıl?',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: 'Kaydolma nedenim',
    reason_options: {
      passwordless: 'Parolasız kimlik doğrulama ve UI kit arayışı',
      efficiency: 'Kutudan çıkan kimlik altyapısı arayışı',
      access_control: 'Kullanıcının rollerine ve sorumluluklarına göre erişim kontrolü',
      multi_tenancy: 'Çok kiracılı bir ürün için stratejiler arayışı',
      enterprise: 'Enterprize hazır SSO çözümleri arayışı',
      others: 'Diğerleri',
    },
  },
  congrats: {
    page_title: 'Erken kredi kazanın',
    title: 'Harika haber! Logto Cloud erken kredisi kazanmaya hak kazandınız!',
    description:
      "Resmi lansmanından sonra Logto Cloud'da ücretsiz <strong>60 gün</strong> aboneliğin tadını çıkarma şansını kaçırmayın! Daha fazla bilgi için hemen Logto ekibiyle iletişime geçin.",
    check_out_button: 'Canlı önizlemeyi kontrol et',
    reserve_title: 'Logto ekibi ile zaman ayırın',
    reserve_description: 'Kredi, değerlendirmeye dayanarak yalnızca bir kez geçerlidir.',
    book_button: 'Şimdi programa al',
    join_description:
      "Diğer geliştiricilerle bağlantı kurmak ve sohbet etmek için genel <a>{{link}}</a>'a katılın.",
    discord_link: 'discord kanalı',
    enter_admin_console: 'Logto Cloud Önizlemesine Girin',
  },
  gift: {
    title: "Logto Cloud'u ücretsiz bir şekilde 60 gün kullanın. Öncüleri şimdi katılın!",
    description: 'Erken kredi için ekibimizle birebir görüşme için yer ayırın.',
    reserve_title: 'Logto ekibiyle zaman ayırın',
    reserve_description: 'Kredi, değerlendirmeye dayanarak yalnızca bir kez geçerlidir.',
    book_button: 'Programa al',
  },
  sie: {
    page_title: 'Oturum açma deneyimini özelleştirin',
    title: 'Öncelikle giriş deneyiminizi kolaylıkla özelleştirin',
    inspire: {
      title: 'Etkileyici örnekler oluşturun',
      description:
        'Giriş deneyiminizden emin değilseniz, sadece " Beni İlhamla"ya tıklayın ve sihrin gerçekleşmesine izin verin!',
      inspire_me: 'Beni ilhamla',
    },
    logo_field: 'Uygulama Logosu',
    color_field: 'Marka rengi',
    identifier_field: 'Tanımlayıcı',
    identifier_options: {
      email: 'E-posta',
      phone: 'Telefon',
      user_name: 'Kullanıcı adı',
    },
    authn_field: 'Kimlik doğrulama',
    authn_options: {
      password: 'Şifre',
      verification_code: 'Doğrulama kodu',
    },
    social_field: 'Sosyal oturum açma',
    finish_and_done: 'Bitir ve tamamla',
    preview: {
      mobile_tab: 'Mobil',
      web_tab: 'Web',
    },
    connectors: {
      unlocked_later: 'Daha sonra kilidi açılacak',
      unlocked_later_tip:
        'Onboarding sürecini tamamladıktan ve ürüne girdikten sonra, daha fazla sosyal oturum açma yöntemine erişiminiz olacaktır.',
      notice:
        'Lütfen üretim amaçlı olarak demo konektörünü kullanmaktan kaçının. Testi tamamladıktan sonra lütfen demo konektörünü silin ve kendi kimlik bilgilerinizle kendi konektörünüzü ayarlayın.',
    },
  },
  broadcast: "📣 Logto Cloud'da (Önizleme) bulunuyorsunuz",
  socialCallback: {
    title: 'Başarıyla giriş yaptınız',
    description:
      "Sosyal hesabınızı kullanarak başarılı bir şekilde giriş yaptınız. Logto'nun tüm özelliklerine sorunsuz entegrasyon ve erişim sağlamak için kendi sosyal konektörünüzü yapılandırmaya devam etmenizi öneririz.",
  },
};

export default cloud;
