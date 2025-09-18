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
    connector_logo: 'Logotipo del conector',
    connector_logo_tip: 'El logotipo se mostrará en el botón de inicio de sesión del conector.',
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
    enable_token_storage: {
      title: 'Almacenar tokens para acceso persistente a la API',
      description:
        'Almacene tokens de acceso y actualización en el Secret Vault. Permite llamadas API automatizadas sin un consentimiento repetido del usuario. Ejemplo: permite que tu agente de IA agregue eventos a Google Calendar con autorización persistente. <a>Aprende a llamar a APIs de terceros</a>',
    },
    callback_uri: 'URI de redirección (URI de devolución de llamada)',
    callback_uri_description:
      'La URI de redirección es donde se redirige a los usuarios tras la autorización social. Añade esta URI a la configuración de tu IdP.',
    callback_uri_custom_domain_description:
      'Si usas varios <a>dominios personalizados</a> en Logto, asegúrate de añadir todas las URI de callback correspondientes a tu IdP para que el inicio de sesión social funcione en cada dominio.\n\nEl dominio predeterminado de Logto (*.logto.app) siempre es válido; inclúyelo solo si también deseas admitir inicios de sesión bajo ese dominio.',
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
  create_form: {
    third_party_connectors:
      'Integra proveedores de terceros para un inicio de sesión social rápido, vinculación de cuentas sociales y acceso a la API. <a>Aprende más</a>',
    standard_connectors: 'O puedes personalizar tu conector social mediante un protocolo estándar.',
  },
};

export default Object.freeze(connectors);
