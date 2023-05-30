const domain = {
  status: {
    connecting: 'Conectando',
    in_used: 'En uso',
    failed_to_connect: 'Error de conexión',
  },
  update_endpoint_alert: {
    description:
      'Su dominio personalizado se ha configurado correctamente. No olvide actualizar el dominio que ha utilizado para {{domain}} si había configurado los recursos a continuación anteriormente.',
    endpoint_url: 'URL del endpoint de <a>{{link}}</a>',
    application_settings_link_text: 'Configuración de la aplicación',
    callback_url: 'URL de callback de <a>{{link}}</a>',
    social_connector_link_text: 'Conector social',
    api_identifier: 'Identificador API de <a>{{link}}</a>',
    uri_management_api_link_text: 'API de gestión de URI',
    tip: 'Después de cambiar la configuración, puede probarla en nuestra experiencia de inicio de sesión <a>{{link}}</a>.',
  },
  custom: {
    custom_domain: 'Dominio personalizado',
    custom_domain_description:
      'Reemplace el dominio predeterminado con su propio dominio para mantener la coherencia con su marca y personalizar la experiencia de inicio de sesión para sus usuarios.',
    custom_domain_field: 'Dominio personalizado',
    custom_domain_placeholder: 'tudominio.com',
    add_domain: 'Agregar dominio',
    invalid_domain_format: 'Formato de dominio no válido',
    steps: {
      add_records: {
        title: 'Agregue los siguientes registros DNS a su proveedor DNS',
        generating_dns_records: 'Generar registros DNS...',
        table: {
          type_field: 'Tipo',
          name_field: 'Nombre',
          value_field: 'Valor',
        },
        finish_and_continue: 'Terminar y continuar',
      },
      verify_domain: {
        title: 'Verifique la conexión de los registros DNS automáticamente',
        description:
          'El proceso se llevará a cabo automáticamente, lo que puede tomar algunos minutos (hasta 24 horas). Puede salir de esta interfaz mientras se ejecuta.',
        error_message: 'Error al verificar. Compruebe su nombre de dominio o registros DNS.',
      },
      generate_ssl_cert: {
        title: 'Genere un certificado SSL automáticamente',
        description:
          'El proceso se llevará a cabo automáticamente, lo que puede tomar algunos minutos (hasta 24 horas). Puede salir de esta interfaz mientras se ejecuta.',
        error_message: 'Error al generar la certificación SSL. ',
      },
      enable_domain: 'Habilitar su dominio personalizado automáticamente',
    },
    deletion: {
      delete_domain: 'Borrar dominio',
      reminder: 'Eliminar dominio personalizado',
      description: '¿Está seguro de que desea eliminar este dominio personalizado?',
      in_used_description:
        '¿Está seguro de que desea eliminar este dominio personalizado "{{domain}}"?',
      in_used_tip:
        'Si configuró este dominio personalizado en su proveedor de conector social o en el endpoint de la aplicación antes, deberá modificar la URI al dominio personalizado de Logto "{{domain}}" primero. Esto es necesario para que el botón de inicio de sesión social funcione correctamente.',
      deleted: '¡Dominio personalizado eliminado con éxito!',
    },
  },
  default: {
    default_domain: 'Dominio predeterminado',
    default_domain_description:
      'Proporcionamos un nombre de dominio predeterminado que se puede utilizar directamente en línea. Siempre está disponible, lo que garantiza que su aplicación siempre se pueda acceder para iniciar sesión, incluso si cambia a un dominio personalizado.',
    default_domain_field: 'Dominio predeterminado de Logto',
  },
};

export default domain;
