const sign_in_exp = {
  title: 'Oturum Açma Deneyimi',
  description:
    'Oturum açma kullanıcı arayüzünü markanıza uyacak şekilde özelleştirin ve gerçek zamanlı olarak görüntüleyin',
  tabs: {
    branding: 'Markalaşma',
    methods: 'Oturum açma yöntemleri',
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
      enable_auto_detect: 'Enable auto detect', // UNTRANSLATED
      description:
        "Your software detects the user's location and switches to the local language. You can add new locales by translating UI from English to another language.", // UNTRANSLATED
      manage_language: 'Manage language', // UNTRANSLATED
      default_language: 'Default language', // UNTRANSLATED
      default_language_description_auto:
        'The default language will be used when a text segment is missing translation.', // UNTRANSLATED
      default_language_description_fixed:
        'When auto detect is off, the default language is the only language your software will show. Turn on auto detect for language customization.', // UNTRANSLATED
    },
    manage_language: {
      title: 'Manage language', // UNTRANSLATED
      subtitle:
        'Localize the product experience by adding languages and translations. Your contribution can be set as the default language.', // UNTRANSLATED
      add_language: 'Add Language', // UNTRANSLATED
      logto_provided: 'Logto provided', // UNTRANSLATED
      key: 'Key', // UNTRANSLATED
      logto_source_language: 'Logto source language', // UNTRANSLATED
      custom_values: 'Custom values', // UNTRANSLATED
      clear_all: 'Clear all', // UNTRANSLATED
      unsaved_description: 'Changes won’t be saved if you leave this page without saving.', // UNTRANSLATED
      deletion_title: 'Do you want to delete the added language?', // UNTRANSLATED
      deletion_description:
        'After deletion, your users won’t be able to browse in that language again.', // UNTRANSLATED
      default_language_deletion_title: 'Default language can’t be deleted.', // UNTRANSLATED
      default_language_deletion_description:
        '{{language}} is set as your default language and can’t be deleted. ', // UNTRANSLATED
      got_it: 'Got It', // UNTRANSLATED
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
