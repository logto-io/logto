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
    favicon: 'Favicon',
    logo_image_url: 'URL de imagen del logotipo de la aplicación',
    logo_image_url_placeholder: 'https://your.cdn.domain/logo.png',
    dark_logo_image_url: 'URL de imagen del logotipo de la aplicación (oscuro)',
    dark_logo_image_url_placeholder: 'https://your.cdn.domain/logo-dark.png',
    logo_image: 'Logotipo de la aplicación',
    dark_logo_image: 'Logotipo de la aplicación (oscuro)',
    logo_image_error: 'Logotipo de la aplicación: {{error}}',
    favicon_error: 'Favicon: {{error}}',
  },
  custom_css: {
    title: 'CSS personalizado',
    css_code_editor_title: 'Personalice su IU con CSS personalizado',
    css_code_editor_description1: 'Vea el ejemplo de CSS personalizado.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Más información',
    css_code_editor_content_placeholder:
      'Ingrese su CSS personalizado para adaptar los estilos de cualquier cosa a sus especificaciones exactas. Expresa tu creatividad y haz que tu IU se destaque.',
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
