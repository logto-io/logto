import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Oturum Açma Deneyimi',
  page_title_with_account: 'Oturum açma ve hesap',
  title: 'Oturum açma ve hesap',
  description:
    "Kimlik doğrulama akışlarını ve UI'yı özelleştirin ve hazır deneyimi gerçek zamanlı olarak önizleyin.",
  tabs: {
    branding: 'Markalaşma',
    sign_up_and_sign_in: 'Kaydol ve Oturum Aç',
    collect_user_profile: 'Kullanıcı profili topla',
    account_center: 'Hesap merkezi',
    content: 'İçerik',
    password_policy: 'Şifre politikası',
  },
  welcome: {
    title: 'Oturum açma deneyimini özelleştirin',
    description:
      'İlk oturum açma işleminizi hızlı bir şekilde başlatın. Bu kılavuz, tüm gerekli ayarları size anlatır.',
    get_started: 'Başla',
    apply_remind:
      'Lütfen unutmayın ki, oturum açma deneyimi bu hesap altındaki tüm uygulamalar için geçerli olacaktır.',
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
    with_light: '{{value}}',
    with_dark: '{{value}} (dark)',
    app_logo_and_favicon: 'Uygulama logosu ve favicon',
    company_logo_and_favicon: 'Şirket logosu ve favicon',
    organization_logo_and_favicon: 'Organizasyon logosu ve favicon',
  },
  branding_uploads: {
    app_logo: {
      title: 'Uygulama logosu',
      url: "Uygulama logosu URL'si",
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Uygulama logosu: {{error}}',
    },
    company_logo: {
      title: 'Şirket logosu',
      url: "Şirket logosu URL'si",
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Şirket logosu: {{error}}',
    },
    organization_logo: {
      title: 'Görsel yükle',
      url: "Organizasyon logosu URL'si",
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Organizasyon logosu: {{error}}',
    },
    connector_logo: {
      title: 'Görsel yükle',
      url: "Bağlayıcı logosu URL'si",
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Bağlayıcı logosu: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: "Favicon URL'si",
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'Özelleştirilmiş UI',
    css_code_editor_title: 'Özelleştirilmiş CSS',
    css_code_editor_description1: 'Özelleştirilmiş CSS örneğine bakın.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Daha fazla bilgi edinin',
    css_code_editor_content_placeholder:
      "Tam olarak istediğiniz özelliklere göre stilleri uyarlamak için özelleştirilmiş CSS'inizi girin. Yaratıcılığınızı ifade edin ve UI'nizi öne çıkarın.",
    bring_your_ui_title: "UI'nizi Getirin",
    bring_your_ui_description:
      "Logto'nun önceden oluşturulmuş UI'sini kendi kodunuzla değiştirmek için sıkıştırılmış bir paket (.zip) yükleyin. <a>Daha fazla bilgi edinin</a>",
    preview_with_bring_your_ui_description:
      'Özelleştirilmiş UI varlıklarınız başarıyla yüklendi ve şimdi sunuluyor. Sonuç olarak, yerleşik önizleme penceresi devre dışı bırakıldı.\nKişiselleştirilmiş oturum açma UI\'nizi test etmek için "Canlı Önizleme" düğmesine tıklayarak yeni bir tarayıcı sekmesinde açın.',
  },
  account_center: {
    title: 'Hesap merkezi',
    description: "Logto API'leri ile hesap merkezi akışlarını özelleştirin.",
    enable_account_api: "Account API'yi etkinleştir",
    enable_account_api_description:
      "Account API'yi etkinleştirerek Logto Management API'sini kullanmadan son kullanıcılara doğrudan API erişimi sağlayan özel bir hesap merkezi oluşturun.",
    field_options: {
      off: 'Off',
      edit: 'Edit',
      read_only: 'Read only',
      enabled: 'Etkin',
      disabled: 'Devre dışı',
    },
    sections: {
      account_security: {
        title: 'ACCOUNT SECURITY',
        description:
          'Manage access to the Account API, enabling users to view or edit their identity information and authentication factors after signing into the application. Users must verify their identity to get a valid 10-minute verification record ID before making these security-related changes.',
        groups: {
          identifiers: {
            title: 'Identifiers',
          },
          authentication_factors: {
            title: 'Authentication factors',
          },
        },
      },
      user_profile: {
        title: 'USER PROFILE',
        description:
          'Manage access to the Account API, enabling users to view or edit basic or custom profile data after signing into the application.',
        groups: {
          profile_data: {
            title: 'Profile data',
          },
        },
      },
      secret_vault: {
        title: 'GİZLİ KASA',
        description:
          "Sosyal ve kurumsal bağlayıcılar için, üçüncü taraf API'lerini çağırmak için üçüncü taraf erişim token'larını güvenli bir şekilde saklayın (örneğin, Google Takvim'e etkinlik ekleyin).",
        third_party_token_storage: {
          title: 'Üçüncü taraf token',
          third_party_access_token_retrieval: 'Üçüncü taraf token',
          third_party_token_tooltip:
            "Token'ları depolamak için, bunu ilgili sosyal veya kurumsal bağlayıcının ayarlarında etkinleştirebilirsiniz.",
          third_party_token_description:
            'Account API etkinleştirildiğinde, üçüncü taraf token alma otomatik olarak etkinleştirilir.',
        },
      },
    },
    fields: {
      email: 'Email address',
      phone: 'Phone number',
      social: 'Social identities',
      password: 'Password',
      mfa: 'Multi-factor authentication',
      mfa_description: 'Let users manage their MFA methods from the account center.',
      username: 'Username',
      name: 'Name',
      avatar: 'Avatar',
      profile: 'Profile',
      profile_description: 'Control access to structured profile attributes.',
      custom_data: 'Custom data',
      custom_data_description: 'Control access to custom JSON data stored on the user.',
    },
    webauthn_related_origins: 'WebAuthn İlgili Kaynaklar',
    webauthn_related_origins_description:
      "Hesap API'si aracılığıyla passkey kaydına izin verilen ön uç uygulamalarınızın alan adlarını ekleyin.",
    webauthn_related_origins_error: 'Kaynak https:// veya http:// ile başlamalıdır',
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Henüz SMS konektörü kurulmadı. Yapılandırmayı tamamlamadan önce, kullanıcılar bu yöntemle oturum açamazlar. "Konektörler"deki <a>{{link}}</a>',
    no_connector_email:
      'Henüz e-posta konektörü kurulmadı. Yapılandırmayı tamamlamadan önce, kullanıcılar bu yöntemle oturum açamazlar. "Konektörler"deki <a>{{link}}</a>',
    no_connector_social:
      'Henüz hiçbir sosyal bağlayıcıyı ayarlamadınız. Sosyal giriş yöntemlerini uygulamak için önce bağlayıcı ekleyin. "Bağlayıcılar" bölümünde <a>{{link}}</a> görüntüleyin.',
    no_connector_email_account_center:
      'Henüz e-posta bağlayıcısı kurulmadı. <a>"E-posta ve SMS bağlayıcıları"</a> bölümünde kurun.',
    no_connector_sms_account_center:
      'Henüz SMS bağlayıcısı kurulmadı. <a>"E-posta ve SMS bağlayıcıları"</a> bölümünde kurun.',
    no_connector_social_account_center:
      'Henüz sosyal bağlayıcı kurulmadı. <a>"Sosyal bağlayıcılar"</a> bölümünde kurun.',
    no_mfa_factor:
      'Henüz MFA faktörü kurulmadı. "Çok faktörlü kimlik doğrulama" bölümünde <a>{{link}}</a>.',
    setup_link: 'Kurulum yapın',
  },
  save_alert: {
    description:
      'Yeni oturum açma ve kaydolma prosedürlerini uygulamaktasınız. Tüm kullanıcılarınız yeni kurulumdan etkilenebilirler. Değişikliği gerçekleştirmek istediğinize emin misiniz?',
    before: 'Önce',
    after: 'Sonra',
    sign_up: 'Kaydolma',
    sign_in: 'Oturum Açma',
    social: 'Sosyal',
    forgot_password_migration_notice:
      "Özel yöntemleri desteklemek için unutulan şifre doğrulamamızı yükselttik. Daha önce bu, E-posta ve SMS bağlayıcılarınız tarafından otomatik olarak belirlenmekteydi. Yükseltmeyi tamamlamak için <strong>Onayla</strong>'ya tıklayın.",
  },
  preview: {
    title: 'Oturum Açma Önizlemesi',
    live_preview: 'Canlı önizleme',
    live_preview_tip: 'Değişiklikleri görmek için kaydedin',
    native: 'Doğal',
    desktop_web: 'Masaüstü Web',
    mobile_web: 'Mobil Web',
    desktop: 'Masaüstü',
    mobile: 'Mobil',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
