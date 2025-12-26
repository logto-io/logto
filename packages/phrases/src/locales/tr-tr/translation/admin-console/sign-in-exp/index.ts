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
    hide_logto_branding: 'Logto markasını gizle',
    hide_logto_branding_description:
      '"Powered by Logto" ibaresini kaldırın. Temiz ve profesyonel bir oturum açma deneyimiyle yalnızca kendi markanızı öne çıkarın.',
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
    title: 'HESAP MERKEZİ',
    description: "Hesap merkezi akışlarını Logto API'leriyle özelleştirin.",
    enable_account_api: "Account API'yi etkinleştir",
    enable_account_api_description:
      "Account API'yi etkinleştirerek özel bir hesap merkezi oluşturun ve Logto Management API'sini kullanmadan son kullanıcılara doğrudan API erişimi sağlayın.",
    field_options: {
      off: 'Kapalı',
      edit: 'Düzenle',
      read_only: 'Yalnızca okuma',
      enabled: 'Etkin',
      disabled: 'Devre dışı',
    },
    sections: {
      account_security: {
        title: 'HESAP GÜVENLİĞİ',
        description:
          'Account API erişimini yöneterek kullanıcıların uygulamada oturum açtıktan sonra kimlik bilgilerini ve kimlik doğrulama faktörlerini görüntülemesine veya düzenlemesine izin verin. Bu güvenlikle ilgili değişiklikleri yapmadan önce kullanıcıların kimliğini doğrulayıp 10 dakika geçerli bir doğrulama kayıt kimliği almaları gerekir.',
        groups: {
          identifiers: {
            title: 'Tanımlayıcılar',
          },
          authentication_factors: {
            title: 'Kimlik doğrulama faktörleri',
          },
        },
      },
      user_profile: {
        title: 'KULLANICI PROFİLİ',
        description:
          'Account API erişimini yöneterek kullanıcıların uygulamada oturum açtıktan sonra temel veya özel profil verilerini görüntülemesine ya da düzenlemesine izin verin.',
        groups: {
          profile_data: {
            title: 'Profil verileri',
          },
        },
      },
      secret_vault: {
        title: 'GİZLİ KASA',
        description:
          "Sosyal ve kurumsal bağlayıcılar için üçüncü taraf erişim belirteçlerini güvenle saklayarak onların API'lerine çağrı yapın (örneğin Google Takvim'e etkinlik ekleyin).",
        third_party_token_storage: {
          title: 'Üçüncü taraf belirteci',
          third_party_access_token_retrieval: 'Üçüncü taraf erişim belirteci alma',
          third_party_token_tooltip:
            'Belirteçleri depolamak için ilgili sosyal veya kurumsal bağlayıcının ayarlarında bu seçeneği etkinleştirebilirsiniz.',
          third_party_token_description:
            'Account API etkinleştirildiğinde üçüncü taraf belirteci alma otomatik olarak etkin hale gelir.',
        },
      },
    },
    fields: {
      email: 'E-posta adresi',
      phone: 'Telefon numarası',
      social: 'Sosyal kimlikler',
      password: 'Parola',
      mfa: 'Çok faktörlü kimlik doğrulama',
      mfa_description: 'Kullanıcıların MFA yöntemlerini hesap merkezinden yönetmesine izin verin.',
      username: 'Kullanıcı adı',
      name: 'Ad',
      avatar: 'Avatar',
      profile: 'Profil',
      profile_description: 'Yapılandırılmış profil özniteliklerine erişimi kontrol edin.',
      custom_data: 'Özel veriler',
      custom_data_description: 'Kullanıcıda saklanan özel JSON verilerine erişimi kontrol edin.',
    },
    webauthn_related_origins: 'WebAuthn İlgili Kaynaklar',
    webauthn_related_origins_description:
      'Account API aracılığıyla passkey kaydedilmesine izin verilen ön uç uygulamalarınızın alan adlarını ekleyin.',
    webauthn_related_origins_error: 'Kaynak https:// veya http:// ile başlamalıdır',
    prebuilt_ui: {
      /** UNTRANSLATED */
      title: 'INTEGRATE PREBUILT UI',
      /** UNTRANSLATED */
      description:
        'Quickly integrate out-of-the-box verification and security setting flows with prebuilt UI.',
      /** UNTRANSLATED */
      flows_title: 'Integrate out-of-the-box security setting flows',
      /** UNTRANSLATED */
      flows_description:
        'Combine your domain with the route to form your account setting URL (e.g., https://auth.foo.com/account/email). Optionally add a `redirect=` URL parameter to return users to your app after successfully updating.',
      tooltips: {
        /** UNTRANSLATED */
        email: 'Update your primary email address',
        /** UNTRANSLATED */
        phone: 'Update your primary phone number',
        /** UNTRANSLATED */
        username: 'Update your username',
        /** UNTRANSLATED */
        password: 'Set a new password',
        /** UNTRANSLATED */
        authenticator_app: 'Set up a new authenticator app for multi-factor authentication',
        /** UNTRANSLATED */
        passkey_add: 'Register a new passkey',
        /** UNTRANSLATED */
        passkey_manage: 'Manage your existing passkeys or add new ones',
        /** UNTRANSLATED */
        backup_codes_generate: 'Generate a new set of 10 backup codes',
        /** UNTRANSLATED */
        backup_codes_manage: 'View your available backup codes or generate new ones',
      },
      /** UNTRANSLATED */
      customize_note: "Don't want the out-of-the-box experience? You can fully",
      /** UNTRANSLATED */
      customize_link: 'customize your flows with the Account API instead.',
    },
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
    no_mfa_factor: 'Henüz MFA faktörü kurulmadı. <a>{{link}}</a> bölümünde kurun.',
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
