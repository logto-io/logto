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
    with_light: '{{value}}',
    with_dark: '{{value}} (escuro)',
    app_logo_and_favicon: 'Logo do aplicativo e favicon',
    company_logo_and_favicon: 'Logo da empresa e favicon',
  },
  branding_uploads: {
    app_logo: {
      title: 'Logo do aplicativo',
      url: 'URL do logo do aplicativo',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo do aplicativo: {{error}}',
    },
    company_logo: {
      title: 'Logo da empresa',
      url: 'URL do logo da empresa',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo da empresa: {{error}}',
    },
    organization_logo: {
      title: 'Upload de imagem',
      url: 'URL do logo da organização',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo da organização: {{error}}',
    },
    connector_logo: {
      title: 'Upload de imagem',
      url: 'URL do logo do conector',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logo do conector: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'URL do favicon',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'UI personalizado',
    css_code_editor_title: 'CSS personalizado',
    css_code_editor_description1: 'Veja o exemplo de CSS personalizado.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Saiba mais',
    css_code_editor_content_placeholder:
      'Insira seu CSS personalizado para ajustar os estilos de qualquer coisa conforme suas especificações exatas. Expresse sua criatividade e faça sua UI se destacar.',
    bring_your_ui_title: 'Traga sua UI',
    bring_your_ui_description:
      'Carregue um pacote compactado (.zip) para substituir a UI pré-construída do Logto pelo seu próprio código. <a>Saiba mais</a>',
    preview_with_bring_your_ui_description:
      'Seus ativos de UI personalizados foram carregados com sucesso e agora estão sendo servidos. Consequentemente, a janela de visualização interna foi desativada.\nPara testar sua UI de login personalizada, clique no botão "Visualização em tempo real" para abri-la em uma nova aba do navegador.',
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
