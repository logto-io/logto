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
    stage_field: 'Ürününüz şu anda hangi aşamada?',
    stage_options: {
      new_product: 'Yeni bir proje başlatmak ve hızlı, hazır bir çözüm arıyorum',
      existing_product:
        'Mevcut kimlik doğrulamadan göç etmek (ör. özelleştirilmiş, Auth0, Cognito, Microsoft)',
      target_enterprise_ready:
        'Yeni büyük müşteriler kazandım ve ürünümü şimdi kurumsal müşterilere satılabilir hale getiriyorum',
    },
    additional_features_field: 'Bilmemizi istediğiniz başka bir şey var mı?',
    additional_features_options: {
      customize_ui_and_flow:
        "Kendi UI'ımı inşa etmek ve yönetmek, sadece Logto'nun önceden yapılandırılmış ve özelleştirilebilir çözümünü kullanmamak",
      compliance: 'SOC2 ve GDPR olmazsa olmaz',
      export_user_data: "Kullanıcı verilerini Logto'dan dışa aktarma yeteneğine ihtiyacım var",
      budget_control: 'Çok sıkı bir bütçe kontrolüm var',
      bring_own_auth:
        'Kendi kimlik doğrulama hizmetlerim var ve sadece bazı Logto özelliklerine ihtiyacım var',
      others: 'Yukarıdakilerden hiçbiri',
    },
  },
  create_tenant: {
    page_title: 'Kiracı oluştur',
    title: 'İlk kiracınızı oluşturun',
    description:
      'Bir kiracı, kullanıcı kimliklerini, uygulamaları ve diğer tüm Logto kaynaklarını yönetebileceğiniz izole bir ortamdır.',
    invite_collaborators: 'E-posta ile işbirlikçilerinizi davet edin',
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
