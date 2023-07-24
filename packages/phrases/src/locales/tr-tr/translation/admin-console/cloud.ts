const cloud = {
  general: {
    onboarding: 'Başlatma',
  },
  welcome: {
    page_title: 'Hoş geldiniz',
    title: "Logto Cloud'a hoş geldiniz! Sizi biraz tanımak istiyoruz.",
    description:
      'Sizi daha iyi tanıyarak Logto deneyiminizi size özel hale getirelim. Bilgileriniz bizimle güvende.',
    project_field: "Logto'yu kullanıyorum çünkü",
    project_options: {
      personal: 'Kişisel proje',
      company: 'Şirket projesi',
    },
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

  sie: {
    page_title: 'Oturum açma deneyimini özelleştirin',
    title: 'Öncelikle giriş deneyiminizi kolaylıkla özelleştirin',
    inspire: {
      title: 'Etkileyici örnekler oluşturun',
      description:
        'Giriş deneyiminizden emin değilseniz, sadece "Beni İlhamla"ya tıklayın ve sihrin gerçekleşmesine izin verin!',
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
  socialCallback: {
    title: 'Başarıyla giriş yaptınız',
    description:
      "Sosyal hesabınızı kullanarak başarılı bir şekilde giriş yaptınız. Logto'nun tüm özelliklerine sorunsuz entegrasyon ve erişim sağlamak için kendi sosyal konektörünüzü yapılandırmaya devam etmenizi öneririz.",
  },
  tenant: {
    create_tenant: 'Kiracı Oluştur',
  },
};

export default cloud;
