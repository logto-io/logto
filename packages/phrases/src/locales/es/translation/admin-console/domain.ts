const domain = {
  status: {
    connecting: 'Conectando',
    in_used: 'En uso',
    failed_to_connect: 'Error de conexión',
  },
  update_endpoint_alert: {
    description:
      'Su dominio personalizado se ha configurado correctamente. No olvide actualizar el dominio que ha utilizado para <span>{{domain}}</span> si había configurado los recursos a continuación anteriormente.',
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
    custom_domain_placeholder: 'tu.dominio.com',
    add_domain: 'Agregar dominio',
    invalid_domain_format:
      'Formato de subdominio no válido. Por favor ingrese un subdominio con al menos tres partes.',
    verify_domain: 'Verificar dominio',
    enable_ssl: 'Habilitar SSL',
    checking_dns_tip:
      'Después de configurar los registros DNS, el proceso se ejecutará automáticamente y puede tardar hasta 24 horas. Puede dejar esta interfaz mientras se está ejecutando.',
    generating_dns_records: 'Generando los registros DNS...',
    add_dns_records: 'Agrega estos registros DNS a tu proveedor de DNS.',
    dns_table: {
      type_field: 'Tipo',
      name_field: 'Nombre',
      value_field: 'Valor',
    },
    deletion: {
      delete_domain: 'Eliminar dominio',
      reminder: 'Eliminar dominio personalizado',
      description: '¿Está seguro de que desea eliminar este dominio personalizado?',
      in_used_description:
        '¿Está seguro de que desea eliminar este dominio personalizado "<span>{{domain}}</span>"?',
      in_used_tip:
        'Si ha configurado este dominio personalizado en su proveedor de conector social o punto final de aplicación antes, deberá modificar la URI al dominio predeterminado de Logto "<span>{{domain}}</span>" primero. Esto es necesario para que el botón de inicio de sesión social funcione correctamente.',
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
