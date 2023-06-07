const domain = {
  status: {
    connecting: 'Conectando',
    in_used: 'En uso',
    failed_to_connect: 'Error de conexión',
  },
  update_endpoint_alert: {
    deleted: '¡Dominio personalizado eliminado con éxito!',
    set_up: 'Su dominio personalizado se ha configurado correctamente.',
    update_tip:
      'Recuerde actualizar el dominio utilizado para <social-link>{{socialLink}}</social-link> y <app-link>{{appLink}}</app-link> si había configurado previamente los recursos.',
    callback_uri_text: 'URI de devolución de llamada del conector social',
    application_text: 'Endpoint Logto para su aplicación',
  },
  error_hint:
    'Asegúrese de actualizar sus registros DNS. Continuaremos verificando cada {{value}} segundos.',
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
    add_dns_records: 'Agregue estos registros DNS a su proveedor de DNS.',
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
        'Si había configurado este dominio personalizado en su proveedor de conector social o punto final de aplicación antes, deberá modificar la URI al dominio predeterminado de Logto "<span>{{dominio}}</span>" primero. Esto es necesario para que el botón de inicio de sesión social funcione correctamente.',
      deleted: '¡Dominio personalizado eliminado con éxito!',
    },
  },
  default: {
    default_domain: 'Dominio predeterminado',
    default_domain_description:
      'Proporcionamos un nombre de dominio predeterminado que se puede utilizar directamente en línea. Siempre está disponible, lo que garantiza que se pueda acceder a su aplicación para iniciar sesión, incluso si cambia a un dominio personalizado.',
    default_domain_field: 'Dominio predeterminado de Logto',
  },
};

export default domain;
