const tenant_settings = {
  title: 'Configuraciones',
  description:
    'Cambie sus configuraciones de cuenta y administre su información personal aquí para garantizar la seguridad de su cuenta.',
  tabs: {
    settings: 'Configuraciones',
    domains: 'Dominios',
  },
  profile: {
    title: 'CONFIGURACIONES DE PERFIL',
    tenant_id: 'ID del inquilino',
    tenant_name: 'Nombre del inquilino',
    environment_tag: 'Etiqueta del entorno',
    environment_tag_description:
      'Los servicios con diferentes etiquetas son idénticos. Funciona como sufijo para ayudar a su equipo a diferenciar entornos.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Información del inquilino guardada correctamente.',
  },
  deletion_card: {
    title: 'ELIMINAR',
    tenant_deletion: 'Eliminar inquilino',
    tenant_deletion_description:
      'La eliminación de su cuenta eliminará toda su información personal, datos de usuario y configuración. Esta acción no se puede deshacer.',
    tenant_deletion_button: 'Eliminar inquilino',
  },
};

export default tenant_settings;
