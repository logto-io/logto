import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Oturum Açma Deneyimi',
  title: 'Oturum Açma Deneyimi',
  description:
    'Oturum açma kullanıcı arayüzünü markanıza uyacak şekilde özelleştirin ve gerçek zamanlı olarak görüntüleyin',
  tabs: {
    branding: 'Markalaşma',
    sign_up_and_sign_in: 'Kaydol ve Oturum Aç',
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
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'Henüz SMS konektörü kurulmadı. Yapılandırmayı tamamlamadan önce, kullanıcılar bu yöntemle oturum açamazlar. "Konektörler"deki <a>{{link}}</a>',
    no_connector_email:
      'Henüz e-posta konektörü kurulmadı. Yapılandırmayı tamamlamadan önce, kullanıcılar bu yöntemle oturum açamazlar. "Konektörler"deki <a>{{link}}</a>',
    no_connector_social:
      'Henüz hiçbir sosyal bağlayıcıyı ayarlamadınız. Sosyal giriş yöntemlerini uygulamak için önce bağlayıcı ekleyin. "Bağlayıcılar" bölümünde <a>{{link}}</a> görüntüleyin.',
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
};

export default Object.freeze(sign_in_exp);
