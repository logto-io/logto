import others from './others.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Oturum Açma Deneyimi',
  title: 'Oturum Açma Deneyimi',
  description:
    'Oturum açma kullanıcı arayüzünü markanıza uyacak şekilde özelleştirin ve gerçek zamanlı olarak görüntüleyin',
  tabs: {
    branding: 'Markalaşma',
    sign_up_and_sign_in: 'Sign up and Sign in',
    others: 'Diğerleri',
  },
  welcome: {
    title: 'Customize sign-in experience',
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.',
    get_started: 'Başla',
    apply_remind:
      'Lütfen oturum açma deneyiminin bu hesap altındaki tüm uygulamalar için geçerli olacağını unutmayınız.',
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
    logo_image: 'App logo',
    dark_logo_image: 'App logo (Dark)',
    logo_image_error: 'App logo: {{error}}',
    favicon_error: 'Favicon: {{error}}',
  },
  custom_css: {
    title: 'Custom CSS',
    css_code_editor_title: 'Personalize your UI with Custom CSS',
    css_code_editor_description1: 'See the example of Custom CSS.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Learn more',
    css_code_editor_content_placeholder:
      'Enter your custom CSS to tailor the styles of anything to your exact specifications. Express your creativity and make your UI stand out.',
  },
  setup_warning: {
    no_connector_sms:
      'No SMS connector set-up yet. Before completing the configuration, users will not be able to sign in with this method. <a>{{link}}</a> in "Connectors"',
    no_connector_email:
      'No email connector set-up yet. Before completing the configuration, users will not be able to sign in with this method. <a>{{link}}</a> in "Connectors"',
    no_connector_social:
      'No social connector set-up yet. Before completing the configuration, users will not be able to sign in with this method. <a>{{link}}</a> in "Connectors"',
    no_added_social_connector:
      'Şimdi birkaç social connector kurdunuz. Oturum açma deneyiminize bazı şeyler eklediğinizden emin olun.',
    setup_link: 'Set up',
  },
  save_alert: {
    description:
      'You are implementing new sign-in and sign-up procedures. All of your users may be affected by the new set-up. Are you sure to commit to the change?',
    before: 'Önce',
    after: 'Sonra',
    sign_up: 'Sign-up',
    sign_in: 'Sign-in',
    social: 'Social',
  },
  preview: {
    title: 'Oturum Açma Önizlemesi',
    live_preview: 'Live preview',
    live_preview_tip: 'Save to preview changes',
    native: 'Doğal',
    desktop_web: 'Masaüstü Web',
    mobile_web: 'Mobil Web',
  },
  others,
  sign_up_and_sign_in,
};

export default sign_in_exp;
