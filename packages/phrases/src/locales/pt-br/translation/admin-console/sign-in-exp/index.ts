import others from './others.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

// UNTRANSLATED
const sign_in_exp = {
  page_title: 'Experiência de login',
  title: 'Experiência de login',
  description:
    'Personalize a interface do usuário de login para corresponder à sua marca e visualize em tempo real',
  tabs: {
    branding: 'Marca',
    sign_up_and_sign_in: 'Inscreva-se e faça login',
    others: 'Outros',
  },
  welcome: {
    title: 'Customize sign-in experience',
    description:
      'Get started fast with your first sign-in setup. This guide walks you through all the necessary settings.',
    get_started: 'Iniciar',
    apply_remind:
      'Observe que a experiência de login será aplicada a todos os aplicativos nesta conta.',
  },
  color: {
    title: 'COR',
    primary_color: 'Cor da marca',
    dark_primary_color: 'Cor da marca (Escuro)',
    dark_mode: 'Ativar modo escuro',
    dark_mode_description:
      'Seu aplicativo terá um tema de modo escuro gerado automaticamente com base na cor da sua marca e no algoritmo Logto. Você é livre para personalizar.',
    dark_mode_reset_tip: 'Recalcule a cor do modo escuro com base na cor da marca.',
    reset: 'Recalcular',
  },
  branding: {
    title: 'ÁREA DE MARCA',
    ui_style: 'Estilo',
    favicon: 'Favicon',
    logo_image_url: 'URL da imagem do logotipo do aplicativo',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'URL da imagem do logotipo do aplicativo (Escuro)',
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
      'Nenhum conector SMS configurado ainda. Até terminar de configurar seu conector SMS, seus usuários não poderá fazer login. <a>{{link}}</a> em "Conectores"',
    no_connector_email:
      'Nenhum conector e-mail configurado ainda. Até terminar de configurar seu conector SMS, seus usuários não poderá fazer login. <a>{{link}}</a> em "Conectores"',
    no_connector_social:
      'Nenhum conector social configurado ainda. Até terminar de configurar seu conector SMS, seus usuários não poderá fazer login. <a>{{link}}</a> em "Conectores"',
    no_added_social_connector:
      'Você configurou alguns conectores sociais agora. Certifique-se de adicionar alguns à sua experiência de login.',
    setup_link: 'Configurar',
  },
  save_alert: {
    description:
      'Você está implementando novos procedimentos de entrada e inscrição. Todos os seus usuários podem ser afetados pela nova configuração. Tem certeza de se comprometer com a mudança?',
    before: 'Antes',
    after: 'Depois',
    sign_up: 'Inscrever-se',
    sign_in: 'Entrar',
    social: 'Social',
  },
  preview: {
    title: 'Visualização de login',
    live_preview: 'Live preview',
    live_preview_tip: 'Save to preview changes',
    native: 'Native',
    desktop_web: 'Desktop Web',
    mobile_web: 'Mobile Web',
  },
  others,
  sign_up_and_sign_in,
};

export default sign_in_exp;
