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
    favicon: 'Favicon',
    logo_image_url: 'Uygulama logosu resim URLi',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'Uygulama logosu resim URLi (Koyu)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    logo_image: 'Uygulama logosu',
    dark_logo_image: 'Uygulama logosu (Koyu)',
    logo_image_error: 'Uygulama logosu: {{error}}',
    favicon_error: 'Favicon: {{error}}',
  },
  custom_css: {
    title: 'Özel CSS',
    css_code_editor_title: "UI'ınızı Özel CSS ile kişiselleştirin",
    css_code_editor_description1: 'Özel CSS örneğini görüntüleyin.',
    css_code_editor_description2: '<a>{{link}}</a>.',
    css_code_editor_description_link_content: 'Daha fazlası için buraya tıklayın',
    css_code_editor_content_placeholder:
      "Tam olarak istediğiniz gibi o herhangi bir şeyin stilini kişiselleştirmek için özel CSS'nizi girin. Yaratıcılığınızı ifade edin ve UI'ınızın dikkat çekmesini sağlayın.",
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
