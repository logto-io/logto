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
    identifiers_sms: 'Phone number', // UNTRANSLATED
    identifiers_username: 'Username', // UNTRANSLATED
    identifiers_email_or_sms: 'Email address or phone number', // UNTRANSLATED
    identifiers_none: 'None', // UNTRANSLATED
    sign_up: {
      title: 'SIGN UP', // UNTRANSLATED
      sign_up_identifier: 'Sign up identifier', // UNTRANSLATED
      sign_up_authentication: 'Sign up authentication', // UNTRANSLATED
      set_a_password_option: 'Set a password', // UNTRANSLATED
      verify_at_sign_up_option: 'Verify at sign up', // UNTRANSLATED
      social_only_creation_description: '(This apply to social only account creation)', // UNTRANSLATED
    },
    sign_in: {
      title: 'SIGN IN', // UNTRANSLATED
      sign_in_identifier_and_auth: 'Sign in identifier and authentication', // UNTRANSLATED
      description:
        'Users can use any one of the selected ways to sign in. Drag and drop to define identifier priority regarding the sign in flow. You can also define the password or verification code priority.', // UNTRANSLATED
      password_auth: 'Password', // UNTRANSLATED
      verification_code_auth: 'Verification code', // UNTRANSLATED
      auth_swap_tip: 'Swap to change the priority', // UNTRANSLATED
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
      enable_auto_detect: 'Enable auto-detect', // UNTRANSLATED
      description:
        "Your software detects the user's locale setting and switches to the local language. You can add new languages by translating UI from English to another language.", // UNTRANSLATED
      manage_language: 'Manage language', // UNTRANSLATED
      default_language: 'Default language', // UNTRANSLATED
      default_language_description_auto:
        'The default language will be used when the detected user language isn’t covered in the current language library.', // UNTRANSLATED
      default_language_description_fixed:
        'When auto-detect is off, the default language is the only language your software will show. Turn on auto-detect for language extension.', // UNTRANSLATED
    },
    manage_language: {
      title: 'Manage language', // UNTRANSLATED
      subtitle:
        'Localize the product experience by adding languages and translations. Your contribution can be set as the default language.', // UNTRANSLATED
      add_language: 'Add Language', // UNTRANSLATED
      logto_provided: 'Logto provided', // UNTRANSLATED
      key: 'Key', // UNTRANSLATED
      logto_source_values: 'Logto source values', // UNTRANSLATED
      custom_values: 'Custom values', // UNTRANSLATED
      clear_all_tip: 'Clear all values', // UNTRANSLATED
      unsaved_description: 'Changes won’t be saved if you leave this page without saving.', // UNTRANSLATED
      deletion_title: 'Do you want to delete the added language?', // UNTRANSLATED
      deletion_tip: 'Delete the language', // UNTRANSLATED
      deletion_description:
        'After deletion, your users won’t be able to browse in that language again.', // UNTRANSLATED
      default_language_deletion_title: 'Default language can’t be deleted.', // UNTRANSLATED
      default_language_deletion_description:
        '{{language}} is set as your default language and can’t be deleted. ', // UNTRANSLATED
      got_it: 'Got It', // UNTRANSLATED
    },
    authentication: {
      title: 'AUTHENTICATION',
      enable_user_registration: 'Enable user registration', // UNTRANSLATED
      enable_user_registration_description:
        'Enable or disallow user registration. Once disabled, users can still be added in the admin console but users can no longer establish accounts through the sign-in UI.', // UNTRANSLATED
      enable_forgot_password: 'Enable forgot password', // UNTRANSLATED
      enable_forgot_password_description:
        'This is the way for users to reset the password when their email or phone number get verified.', // UNTRANSLATED
      disallow_forgot_password_description:
        'Your identifiers can’t be verified due to the current settings. Enable email or phone in sign up or select verification code in sign in to enable forget password.', // UNTRANSLATED
    },
  },
  setup_warning: {
    no_connector: '',
    no_connector_sms:
      'Henüz bir SMS bağlayıcısı kurmadınız. Öncelikle ayarları tamamlayana kadar oturum açma deneyiminiz yayınlanmayacaktır. ',
    no_connector_email:
      'Henüz bir e-posta adresi bağlayıcısı kurmadınız. Öncelikle ayarları tamamlayana kadar oturum açma deneyiminiz yayınlanmayacaktır. ',
    no_connector_social:
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
