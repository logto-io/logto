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
      'Use etiquetas para diferenciar entre los entornos de uso del inquilino. Los servicios dentro de cada etiqueta son idénticos, lo que garantiza la consistencia.',
    environment_tag_development: 'Desarrollo',
    environment_tag_staging: 'Puesta en escena',
    environment_tag_production: 'Producción',
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
