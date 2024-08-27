import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Experiencia de inicio de sesión',
  title: 'Experiencia de inicio de sesión',
  description:
    'Personalice la interfaz de inicio de sesión para que se adapte a su marca y visualice en tiempo real',
  tabs: {
    branding: 'Branding',
    sign_up_and_sign_in: 'Registro e inicio de sesión',
    content: 'Contenido',
    password_policy: 'Política de contraseña',
  },
  welcome: {
    title: 'Personalice la experiencia de inicio de sesión',
    description:
      'Comience rápidamente con su primera configuración de inicio de sesión. Esta guía lo guiará a través de todas las configuraciones necesarias.',
    get_started: 'Comenzar',
    apply_remind:
      'Tenga en cuenta que la experiencia de inicio de sesión se aplicará a todas las aplicaciones de esta cuenta.',
  },
  color: {
    title: 'COLOR',
    primary_color: 'Color de la marca',
    dark_primary_color: 'Color de la marca (oscuro)',
    dark_mode: 'Habilitar modo oscuro',
    dark_mode_description:
      'Su aplicación tendrá un tema de modo oscuro generado automáticamente en función del color de su marca y el algoritmo de Logto. Puede personalizarlo libremente.',
    dark_mode_reset_tip:
      'Vuelva a calcular el color del modo oscuro en función del color de la marca.',
    reset: 'Volver a calcular',
  },
  branding: {
    title: 'ÁREA DE BRANDING',
    ui_style: 'Estilo',
    with_light: '{{value}}',
    with_dark: '{{value}} (oscuro)',
    app_logo_and_favicon: 'Logotipo y favicon de la aplicación',
    company_logo_and_favicon: 'Logotipo y favicon de la empresa',
  },
  branding_uploads: {
    app_logo: {
      title: 'Logotipo de la aplicación',
      url: 'URL del logotipo de la aplicación',
      url_placeholder: 'https://tu.cdn.dominio/logo.png',
      error: 'Logotipo de la aplicación: {{error}}',
    },
    company_logo: {
      title: 'Logotipo de la empresa',
      url: 'URL del logotipo de la empresa',
      url_placeholder: 'https://tu.cdn.dominio/logo.png',
      error: 'Logotipo de la empresa: {{error}}',
    },
    organization_logo: {
      title: 'Subir imagen',
      url: 'URL del logotipo de la organización',
      url_placeholder: 'https://tu.cdn.dominio/logo.png',
      error: 'Logotipo de la organización: {{error}}',
    },
    connector_logo: {
      title: 'Subir imagen',
      url: 'URL del logotipo del conector',
      url_placeholder: 'https://tu.cdn.dominio/logo.png',
      error: 'Logotipo del conector: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'URL del favicon',
      url_placeholder: 'https://tu.cdn.dominio/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'Interfaz personalizada',
    css_code_editor_title: 'CSS personalizado',
    css_code_editor_description1: 'Vea el ejemplo de CSS personalizado.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Aprende más',
    css_code_editor_content_placeholder:
      'Introduce tu CSS personalizado para adaptar los estilos de cualquier cosa a tus especificaciones exactas. Expresa tu creatividad y haz que tu interfaz de usuario destaque.',
    bring_your_ui_title: 'Trae tu interfaz de usuario',
    bring_your_ui_description:
      'Sube un paquete comprimido (.zip) para reemplazar la interfaz de usuario preconstruida de Logto con tu propio código. <a>Aprende más</a>',
    preview_with_bring_your_ui_description:
      'Tus activos de la interfaz de usuario personalizada se han subido con éxito y ahora se están sirviendo. En consecuencia, la ventana de vista previa incorporada se ha deshabilitado.\nPara probar tu interfaz de inicio de sesión personalizada, haz clic en el botón "Vista previa en vivo" para abrirla en una nueva pestaña del navegador.',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
  setup_warning: {
    no_connector_sms:
      'Aún no se ha configurado el conector SMS. Antes de completar la configuración, los usuarios no podrán iniciar sesión con este método. <a>{{link}}</a> en "Conectores"',
    no_connector_email:
      'Aún no se ha configurado el conector de correo electrónico. Antes de completar la configuración, los usuarios no podrán iniciar sesión con este método. <a>{{link}}</a> en "Conectores"',
    no_connector_social:
      'Todavía no ha configurado ningún conector social. Agregue conectores primero para aplicar métodos de inicio de sesión social. <a>{{link}}</a> en "Conectores".',
    setup_link: 'Configuración',
  },
  save_alert: {
    description:
      'Está implementando nuevos procedimientos de inicio de sesión y registro. Todos sus usuarios pueden verse afectados por la nueva configuración. ¿Estás seguro de comprometerte con el cambio?',
    before: 'Antes',
    after: 'Después',
    sign_up: 'Registro',
    sign_in: 'Inicio de sesión',
    social: 'Social',
  },
  preview: {
    title: 'Previsualización del inicio de sesión',
    live_preview: 'Vista previa en vivo',
    live_preview_tip: 'Guarde para previsualizar los cambios',
    native: 'Nativo',
    desktop_web: 'Web de escritorio',
    mobile_web: 'Web móvil',
    desktop: 'Escritorio',
    mobile: 'Móvil',
  },
};

export default Object.freeze(sign_in_exp);
