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
    company_name_field: 'Şirket adı',
    company_name_placeholder: 'Acme.co',
    /** UNTRANSLATED */
    stage_field: 'What stage is your product currently in?',
    stage_options: {
      /** UNTRANSLATED */
      new_product: 'Start a new project and looking for a quick, out-of-the-box solution',
      /** UNTRANSLATED */
      existing_product:
        'Migrate from current authentication (e.g., self-built, Auth0, Cognito, Microsoft)',
      /** UNTRANSLATED */
      target_enterprise_ready:
        'I just landed bigger clients and now make my product ready to sell to enterprises',
    },
    /** UNTRANSLATED */
    additional_features_field: 'Do you have anything else you want us to know?',
    additional_features_options: {
      /** UNTRANSLATED */
      customize_ui_and_flow:
        'Need the ability to bring my own UI, or customize my own flows via Logto API',
      /** UNTRANSLATED */
      compliance: 'SOC2 and GDPR are must-haves',
      /** UNTRANSLATED */
      export_user_data: 'Need the ability to export user data from Logto',
      /** UNTRANSLATED */
      budget_control: 'I have very tight budget control',
      /** UNTRANSLATED */
      bring_own_auth: 'Have my own auth services and just need some Logto features',
      /** UNTRANSLATED */
      others: 'None of these above',
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

export default Object.freeze(cloud);
