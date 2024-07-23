import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Experiência de login',
  title: 'Experiência de login',
  description:
    'Personalize a interface de login para corresponder a sua marca e visualize em tempo real',
  tabs: {
    branding: 'Marca',
    sign_up_and_sign_in: 'Registo e login',
    content: 'Conteúdo',
    password_policy: 'Política de senha',
  },
  welcome: {
    title: 'Personalize a experiência de início de sessão',
    description:
      'Comece rapidamente com a configuração do seu primeiro início de sessão. Este guia orienta-o através de todas as definições necessárias.',
    get_started: 'Começar',
    apply_remind: 'Observe que a experiência de login será aplicada a todos os apps nesta conta.',
  },
  color: {
    title: 'COR',
    primary_color: 'Cor da marca',
    dark_primary_color: 'Cor da marca (tema escuro)',
    dark_mode: 'Ativar tema escuro',
    dark_mode_description:
      'O app terá um tema escuro gerado automaticamente com base na cor da marca e no algoritmo Logto. contudo é livre de personalizar.',
    dark_mode_reset_tip: 'Recalcular a cor do tema escuro com base na cor da marca.',
    reset: 'Recalcular',
  },
  branding: {
    title: 'ÁREA DE MARCA',
    ui_style: 'Estilo',
    with_light: '{{value}}',
    with_dark: '{{value}} (dark)',
    app_logo_and_favicon: 'Logótipo e favicon do aplicativo',
    company_logo_and_favicon: 'Logótipo e favicon da empresa',
  },
  branding_uploads: {
    app_logo: {
      title: 'Logótipo do aplicativo',
      url: 'URL do logótipo do aplicativo',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logótipo do aplicativo: {{error}}',
    },
    company_logo: {
      title: 'Logótipo da empresa',
      url: 'URL do logótipo da empresa',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logótipo da empresa: {{error}}',
    },
    organization_logo: {
      title: 'Carregar imagem',
      url: 'URL do logótipo da organização',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logótipo da organização: {{error}}',
    },
    connector_logo: {
      title: 'Carregar imagem',
      url: 'URL do logótipo do conector',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Logótipo do conector: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'URL do Favicon',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'UI personalizada',
    css_code_editor_title: 'CSS personalizado',
    css_code_editor_description1: 'Veja um exemplo de CSS personalizado.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Saiba mais',
    css_code_editor_content_placeholder:
      'Insira o seu CSS personalizado para adaptar os estilos de qualquer coisa às suas especificações exatas. Exprima a sua criatividade e faça o seu UI se destacar.',
    bring_your_ui_title: 'Traga o seu UI',
    bring_your_ui_description:
      'Carregue um pacote comprimido (.zip) para substituir o UI predefinido do Logto pelo seu próprio código. <a>Saiba mais</a>',
    preview_with_bring_your_ui_description:
      'Os seus recursos de UI personalizados foram carregados com êxito e agora estão sendo servidos. Consequentemente, a janela de visualização incorporada foi desativada.\nPara testar o seu UI de início de sessão personalizado, clique no botão "Visualização ao vivo" para abri-lo num novo separador do navegador.',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'Ainda não foi configurado nenhum conector SMS. Antes de concluir a configuração, os utilizadores não poderão iniciar sessão com este método. <a>{{link}}</a> em "Conectores"',
    no_connector_email:
      'Ainda não foi configurado qualquer conector de email. Antes de concluir a configuração, os utilizadores não poderão iniciar sessão com este método. <a>{{link}}</a> em "Conectores"',
    no_connector_social:
      'Você ainda não configurou nenhum conector social. Adicione conectores primeiro para aplicar métodos de login social. <a>{{link}}</a> em "Conectores".',
    setup_link: 'Configurar',
  },
  save_alert: {
    description:
      'Está a implementar novos procedimentos de início de sessão e registo. Todos os seus utilizadores podem ser afetados pela nova configuração. Tem a certeza de que quer confirmar a alteração?',
    before: 'Antes',
    after: 'Depois',
    sign_up: 'Registo',
    sign_in: 'Iniciar sessão',
    social: 'Social',
  },
  preview: {
    title: 'Visualização prévia do login',
    live_preview: 'Visualização ao vivo',
    live_preview_tip: 'Guardar para visualizar as alterações',
    native: 'App nativa',
    desktop_web: 'Web no computador',
    mobile_web: 'Web no telemóvel',
    desktop: 'Ambiente de trabalho',
    mobile: 'Móvel',
  },
};

export default Object.freeze(sign_in_exp);
