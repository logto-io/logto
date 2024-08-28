const connectors = {
  page_title: 'Conectores',
  title: 'Conectores',
  subtitle:
    'Configure conectores para habilitar la experiencia de inicio de sesión sin contraseña y con redes sociales',
  create: 'Agregar conector social',
  config_sie_notice: 'Has configurado conectores. Asegúrate de configurarlo en <a>{{link}}</a>.',
  config_sie_link_text: 'experiencia de inicio de sesión',
  tab_email_sms: 'Conectores de correo electrónico y SMS',
  tab_social: 'Conectores sociales',
  connector_name: 'Nombre del conector',
  demo_tip:
    'El número máximo de mensajes permitidos para este conector de demostración está limitado a 100 y no se recomienda para implementación en un entorno de producción.',
  social_demo_tip:
    'El conector de demostración está diseñado exclusivamente para fines de demostración y no se recomienda para implementación en un entorno de producción.',
  connector_type: 'Tipo',
  connector_status: 'Experiencia de inicio de sesión',
  connector_status_in_use: 'En uso',
  connector_status_not_in_use: 'No en uso',
  not_in_use_tip: {
    content:
      'No en uso significa que tu experiencia de inicio de sesión no ha utilizado este método de inicio de sesión. <a>{{link}}</a> para agregar este método de inicio de sesión. ',
    go_to_sie: 'Ir a la experiencia de inicio de sesión',
  },
  placeholder_title: 'Conector social',
  placeholder_description:
    'Logto ha proporcionado muchos conectores de inicio de sesión social ampliamente utilizados, mientras tanto, puede crear el suyo con protocolos estándar.',
  save_and_done: 'Guardar y finalizar',
  type: {
    email: 'Conector de correo electrónico',
    sms: 'Conector SMS',
    social: 'Conector social',
  },
  setup_title: {
    email: 'Configure el conector de correo electrónico',
    sms: 'Configure el conector SMS',
    social: 'Agregar conector social',
  },
  guide: {
    subtitle: 'Una guía paso a paso para configurar su conector',
    general_setting: 'Configuraciones generales',
    parameter_configuration: 'Configuración de parámetros',
    test_connection: 'Prueba de conexión',
    name: 'Nombre para el botón de inicio de sesión social',
    name_placeholder: 'Ingrese el nombre para el botón de inicio de sesión social',
    name_tip:
      'El nombre del botón del conector se mostrará como "Continuar con {{name}}". Siempre tenga en cuenta la longitud del nombre en caso de que sea demasiado largo.',
    logo: 'URL del logotipo para el botón de inicio de sesión social',
    logo_placeholder: 'https://tudominio.cdn/logo.png',
    logo_tip:
      'La imagen del logotipo se mostrará en el conector. Obtenga un enlace de imagen accesible públicamente e insértelo aquí.',
    logo_dark: 'URL del logotipo para el botón de inicio de sesión social (modo oscuro)',
    logo_dark_placeholder: 'https://tudominio.cdn/logo.png',
    logo_dark_tip:
      'Configure el logotipo de su conector para el modo oscuro después de activarlo en la Experiencia de inicio de sesión del Panel de administrador.',
    logo_dark_collapse: 'Colapso',
    logo_dark_show: 'Mostrar configuración de logotipo para modo oscuro',
    target: 'Nombre del proveedor de identidad',
    target_placeholder: 'Ingrese el nombre del proveedor de identidad del conector',
    target_tip:
      'El valor de "nombre del IdP" puede ser una cadena de identificador única para distinguir sus identificadores sociales.',
    target_tip_standard:
      'El valor de "nombre del IdP" puede ser una cadena de identificador única para distinguir sus identificadores sociales. Esta configuración no se puede cambiar después de crear el conector.',
    target_tooltip:
      'El "nombre del IdP" en los conectores sociales de Logto se refiere a la "fuente" de sus identidades sociales. En el diseño de Logto, no aceptamos el mismo "nombre del IdP" de una plataforma específica para evitar conflictos. Debe ser muy cuidadoso antes de agregar un conector ya que NO PUEDE cambiar su valor una vez que lo crea. <a>Obtener más información</a>',
    target_conflict:
      'El nombre del IdP ingresado coincide con el conector de nombre <span></span>. Utilizar el mismo nombre del IdP puede provocar un comportamiento de inicio de sesión inesperado donde los usuarios pueden acceder a la misma cuenta a través de dos conectores diferentes.',
    target_conflict_line2:
      'Si desea reemplazar el conector actual con el mismo proveedor de identidad y permitir que los usuarios anteriores inicien sesión sin registrarse nuevamente, elimine el conector <span></span> y cree uno nuevo con el mismo "nombre de IdP".',
    target_conflict_line3:
      'Si desea conectarse a un proveedor de identidad diferente, modifique el "nombre del IdP" y continúe.',
    config: 'Ingrese su JSON de configuración',
    sync_profile: 'Sincronizar información del perfil',
    sync_profile_only_at_sign_up: 'Sincronice solo en el registro',
    sync_profile_each_sign_in: 'Siempre sincronice en cada inicio de sesión',
    sync_profile_tip:
      'Sincronice el perfil básico del proveedor social, como los nombres de los usuarios y sus avatares.',
    callback_uri: 'URI de devolución de llamada',
    callback_uri_description:
      'También llamado URI de redireccionamiento, es la URI en Logto a la que se enviarán los usuarios después de la autorización social, copie y pegue en la página de configuración del proveedor social.',
    acs_url: 'URL del servicio de consumo de afirmaciones',
  },
  platform: {
    universal: 'Universal',
    web: 'Web',
    native: 'Nativo',
  },
  add_multi_platform: 'admite múltiples plataformas, seleccione una plataforma para continuar',
  drawer_title: 'Guía del conector',
  drawer_subtitle: 'Siga las instrucciones para integrar su conector',
  unknown: 'Conector desconocido',
  standard_connectors: 'Conectores estándar',
};

export default Object.freeze(connectors);
