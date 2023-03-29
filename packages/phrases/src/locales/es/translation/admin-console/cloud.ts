const cloud = {
  welcome: {
    title: 'Bienvenido y creemos su propia vista previa de Logto Cloud',
    description:
      'Ya sea que sea un usuario de código abierto o en la nube, realice un recorrido por la vitrina y experimente el valor completo de Logto. La vista previa en la nube también sirve como una versión preliminar de Logto Cloud.',
    project_field: 'Estoy usando Logto para:',
    project_options: {
      personal: 'Proyecto personal',
      company: 'Proyecto empresarial',
    },
    deployment_type_field: '¿Prefiere el código abierto o la nube?',
    deployment_type_options: {
      open_source: 'Código abierto',
      cloud: 'Nube',
    },
  },
  about: {
    title: 'Un poco sobre ti',
    description:
      'Hagamos que su experiencia de Logto sea única para usted al conocerlo mejor. Su información está segura con nosotros.',
    title_field: 'Tu título',
    title_options: {
      developer: 'Desarrollador',
      team_lead: 'Líder de equipo',
      ceo: 'CEO',
      cto: 'CTO',
      product: 'Producto',
      others: 'Otros',
    },
    company_name_field: 'Nombre de la empresa',
    company_name_placeholder: 'Acme.co',
    company_size_field: '¿Cómo es el tamaño de su empresa?',
    company_options: {
      size_1: '1',
      size_2_49: '2-49',
      size_50_199: '50-199',
      size_200_999: '200-999',
      size_1000_plus: '1000+',
    },
    reason_field: 'Me registro porque',
    reason_options: {
      passwordless: 'Buscando autenticación sin contraseña y kit de IU',
      efficiency: 'Encontrar una infraestructura de identidad lista para usar',
      access_control: 'Controlar el acceso del usuario en función de roles y responsabilidades',
      multi_tenancy: 'Buscando estrategias para un producto de multipropiedad',
      enterprise: 'Encontrar soluciones SSO para la preparación empresarial',
      others: 'Otros',
    },
  },
  congrats: {
    title: '¡Excelentes noticias! ¡Está calificado para ganar crédito anticipado de Logto Cloud!',
    description:
      '¡No pierda la oportunidad de disfrutar de una suscripción gratuita de <strong>60 días</strong> a Logto Cloud después de su lanzamiento oficial! Comuníquese con el equipo de Logto ahora para obtener más información.',
    check_out_button: 'Ver la vista previa en vivo',
    reserve_title: 'Reserve su tiempo con el equipo de Logto',
    reserve_description: 'El crédito solo es elegible una vez validado.',
    book_button: 'Programar ahora',
    join_description:
      'Únase a nuestro <a>{{link}}</a> público para conectarse y charlar con otros desarrolladores.',
    discord_link: 'canal de discordia',
    enter_admin_console: 'Ingrese a Logto Cloud Preview',
  },
  gift: {
    title: 'Use Logto Cloud gratis durante 60 días. ¡Únase a los pioneros ahora!',
    description:
      'Reserve una sesión individual con nuestro equipo para obtener crédito anticipado.',
    reserve_title: 'Reserve su tiempo con el equipo de Logto',
    reserve_description: 'El crédito solo es elegible una vez evaluado.',
    book_button: 'Reservar',
  },
  sie: {
    title: 'Primero personalicemos su experiencia de inicio de sesión con facilidad',
    inspire: {
      title: 'Crear ejemplos convincentes',
      description:
        '¿Se siente inseguro acerca de la experiencia de inicio de sesión? ¡Simplemente haga clic en "Inspíreme" y deje que suceda la magia!',
      inspire_me: 'Inspírame',
    },
    logo_field: 'Logotipo de la aplicación',
    color_field: 'Color de marca',
    identifier_field: 'Identificador',
    identifier_options: {
      email: 'Correo electrónico',
      phone: 'Teléfono',
      user_name: 'Nombre de usuario',
    },
    authn_field: 'Autenticación',
    authn_options: {
      password: 'Contraseña',
      verification_code: 'Código de verificación',
    },
    social_field: 'Inicio de sesión social',
    finish_and_done: 'Terminar y listo',
    preview: {
      mobile_tab: 'Móvil',
      web_tab: 'Web',
    },
    connectors: {
      unlocked_later: 'Desbloqueado más adelante',
      unlocked_later_tip:
        'Una vez que haya completado el proceso de incorporación y haya ingresado al producto, tendrá acceso a una mayor cantidad de métodos de inicio de sesión social.',
      notice:
        'Evite utilizar el conector de demostración con fines de producción. Una vez que haya completado las pruebas, elimine amablemente el conector de demostración y configure su propio conector con sus credenciales.',
    },
  },
  broadcast: '📣 Está en Logto Cloud (Preview)',
  socialCallback: {
    title: 'Ha iniciado sesión correctamente',
    description:
      'Ha iniciado sesión correctamente utilizando su cuenta social. Para garantizar una integración perfecta y el acceso a todas las funciones de Logto, recomendamos que proceda a configurar su propio conector social.',
  },
};

export default cloud;
