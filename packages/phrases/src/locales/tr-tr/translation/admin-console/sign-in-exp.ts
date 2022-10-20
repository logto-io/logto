const sign_in_exp = {
  title: 'Oturum Açma Deneyimi',
  description:
    'Oturum açma kullanıcı arayüzünü markanıza uyacak şekilde özelleştirin ve gerçek zamanlı olarak görüntüleyin',
  tabs: {
    branding: 'Markalaşma',
    sign_up_and_sign_in: 'Sign up and Sign in', // UNTRANSLATED
    others: 'Diğerleri',
  },
  welcome: {
    title:
      'Bu oturum açma deneyimini ilk kez tanımlıyorsunuz. Bu kılavuz, gerekli tüm ayarları yapmanıza ve hızlı bir şekilde başlamanıza yardımcı olacaktır.',
    get_started: 'Başla',
    apply_remind:
      'Lütfen oturum açma deneyiminin bu hesap altındaki tüm uygulamalar için geçerli olacağını unutmayınız.',
    got_it: 'Anladım',
  },
  color: {
    title: 'RENK',
    primary_color: 'Marka rengi',
    dark_primary_color: 'Marka rengi (Koyu)',
    dark_mode: 'Koyu modu etkinleştir',
    dark_mode_description:
      'Uygulamanız, markanızın rengine ve logo algoritmasına göre otomatik olarak oluşturulmuş bir koyu mod temasına sahip olacaktır. Özelleştirmekte özgürsünüz.',
    dark_mode_reset_tip: 'Marka rengine göre koyu mod rengini yeniden hesaplayınız.',
    reset: 'Yeniden hesapla',
  },
  branding: {
    title: 'MARKA ALANI',
    ui_style: 'Stil',
    styles: {
      logo_slogan: 'Sloganlı şekilde uygulama logosu',
      logo: 'Yalnızca uygulama logosu',
    },
    logo_image_url: 'Uygulama logosu resim URLi',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'Uygulama logosu resim URLi (Koyu)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    slogan: 'Slogan',
    slogan_placeholder: 'Yaratıcılığınızı açığa çıkarın',
  },
  sign_up_and_sign_in: {
    identifiers: 'Sign up identifiers', // UNTRANSLATED
    identifiers_email: 'Email address', // UNTRANSLATED
    identifiers_phone: 'Phone number', // UNTRANSLATED
    identifiers_username: 'Username', // UNTRANSLATED
    identifiers_email_or_phone: 'Email address or phone number', // UNTRANSLATED
    identifiers_none: 'None', // UNTRANSLATED
    sign_up: {
      title: 'SIGN UP', // UNTRANSLATED
      sign_up_identifier: 'Sign up identifier', // UNTRANSLATED
      sign_up_authentication: 'Sign up authentication', // UNTRANSLATED
      set_a_password_option: 'Set a password', // UNTRANSLATED
      verify_at_sign_up_option: 'Verify at sign up', // UNTRANSLATED
      social_only_creation_description: '(This apply to social only account creation)', // UNTRANSLATED
    },
  },
  sign_in_methods: {
    title: 'OTURUM AÇMA YÖNTEMLERİ',
    primary: 'Birincil oturum açma yöntemi',
    enable_secondary: 'İkincil oturum açmayı etkinleştir',
    enable_secondary_description:
      'Açıldığında, uygulamanız birincil yöntemin yanı sıra daha fazla oturum açma yöntemini destekleyecektir. ',
    methods: 'Oturum açma yöntemi',
    methods_sms: 'Telefon numarası girişi',
    methods_email: 'E-posta adresi girişi',
    methods_social: 'Sosyal platform girişi',
    methods_username: 'Kullanıcı adı ve şifre ile oturum açma',
    methods_primary_tag: '(Primary)',
    define_social_methods: 'Sosyal platform oturum açma yöntemlerini tanımlama',
    transfer: {
      title: 'Social connectorlar',
      footer: {
        not_in_list: 'Listede yok?',
        set_up_more: 'Daha fazlasını ayarla',
        go_to: 'Social connectorlara veya “Connectors” bölümüne git.',
      },
    },
  },
  others: {
    terms_of_use: {
      title: 'KULLANIM KOŞULLARI',
      enable: 'Kullanım koşullarını etkinleştir',
      description: 'Ürününüzün kullanımına ilişkin yasal anlaşmaları ekleyin',
      terms_of_use: 'Kullanım koşulları',
      terms_of_use_placeholder: 'https://your.terms.of.use/',
      terms_of_use_tip: 'Kullanım koşulları URLi',
    },
    languages: {
      title: 'DİLLER',
      mode: 'Dil modu',
      auto: 'Otomatik',
      fixed: 'Sabit',
      fallback_language: 'Yedek dil',
      fallback_language_tip:
        'Logto uygun bir dil ifade kümesi bulamazsa hangi dilden vazgeçilecek?',
      fixed_language: 'Sabitlenmiş dil',
    },
    authentication: {
      title: 'AUTHENTICATION',
      enable_create_account: 'Enable create account',
      enable_create_account_description:
        'Enable or disable create account (sign-up). Once disabled, your customers can’t create accounts through the sign-in UI, but you can still add users in Admin Console.',
    },
  },
  setup_warning: {
    no_connector: '',
    no_connector_phone:
      'Henüz bir SMS bağlayıcısı kurmadınız. Öncelikle ayarları tamamlayana kadar oturum açma deneyiminiz yayınlanmayacaktır. ',
    no_connector_email:
      'Henüz bir e-posta adresi bağlayıcısı kurmadınız. Öncelikle ayarları tamamlayana kadar oturum açma deneyiminiz yayınlanmayacaktır. ',
    no_connector_email_or_phone:
      'You haven’t set up both Email and SMS connectors yet. Your sign in experience won’t go live until you finish the settings first. ', // UNTRANSLATED
    no_connector_none:
      'Henüz herhangi bir social connector kurmadınız. Öncelikle ayarları tamamlayana kadar oturum açma deneyiminiz yayınlanmayacaktır. ',
    no_added_social_connector:
      'Şimdi birkaç social connector kurdunuz. Oturum açma deneyiminize bazı şeyler eklediğinizden emin olun.',
  },
  save_alert: {
    description:
      'Oturum açma yöntemlerini değiştiriyorsunuz. Bu, bazı kullanıcılarınızı etkileyecektir. Bunu yapmak istediğine emin misin?',
    before: 'Önce',
    after: 'Sonra',
  },
  preview: {
    title: 'Oturum Açma Önizlemesi',
    dark: 'Koyu',
    light: 'Açık',
    native: 'Doğal',
    desktop_web: 'Masaüstü Web',
    mobile_web: 'Mobil Web',
  },
};

export default sign_in_exp;
