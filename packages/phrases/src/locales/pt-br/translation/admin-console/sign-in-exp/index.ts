import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Experiência de login',
  title: 'Experiência de login',
  description:
    'Personalize a interface do usuário de login para corresponder à sua marca e visualize em tempo real',
  tabs: {
    branding: 'Marca',
    sign_up_and_sign_in: 'Inscreva-se e faça login',
    content: 'Conteúdo',
    password_policy: 'Política de senhas',
  },
  welcome: {
    title: 'Personalize a experiência de login',
    description:
      'Comece rapidamente com a configuração do seu primeiro login. Este guia o acompanhará em todas as configurações necessárias.',
    get_started: 'Começar',
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
    logo_image: 'Logotipo do aplicativo',
    dark_logo_image: 'Logotipo do aplicativo (Escuro)',
    logo_image_error: 'Logotipo do aplicativo: {{error}}',
    favicon_error: 'Favicon: {{error}}',
  },
  custom_css: {
    title: 'CSS personalizado',
    css_code_editor_title: 'Personalize sua UI com CSS personalizado',
    css_code_editor_description1: 'Veja o exemplo de CSS personalizado.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Saiba mais',
    css_code_editor_content_placeholder:
      'Digite seu CSS personalizado para personalizar os estilos de qualquer coisa de acordo com suas especificações exatas. Expresse sua criatividade e faça sua IU se destacar.',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'Nenhum conector SMS configurado ainda. Até terminar de configurar seu conector SMS, seus usuários não poderão fazer login. <a>{{link}}</a> em "Conectores"',
    no_connector_email:
      'Nenhum conector de e-mail configurado ainda. Até terminar de configurar seu conector de e-mail, seus usuários não poderão fazer login. <a>{{link}}</a> em "Conectores"',
    no_connector_social:
      'Você ainda não configurou nenhum conector social. Adicione conectores primeiro para aplicar métodos de login social. <a>{{link}}</a> em "Conectores".',
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
    live_preview: 'Visualização em tempo real',
    live_preview_tip: 'Salve para visualizar as alterações',
    native: 'Nativo',
    desktop_web: 'Web Desktop',
    mobile_web: 'Web Mobile',
    desktop: 'Área de trabalho',
    mobile: 'Móvel',
  },
};

export default Object.freeze(sign_in_exp);
