const tenant_settings = {
  title: 'Configuraciones',
  description: 'Administre eficientemente la configuración del inquilino y personalice su dominio.',
  tabs: {
    settings: 'Configuraciones',
    domains: 'Dominios',
  },
  settings: {
    title: 'CONFIGURACIONES',
    tenant_id: 'ID del inquilino',
    tenant_name: 'Nombre del inquilino',
    environment_tag: 'Etiqueta del entorno',
    environment_tag_description:
      'Las etiquetas no alteran el servicio. Simplemente te guían para diferenciar diversos entornos.',
    environment_tag_development: 'Des',
    environment_tag_staging: 'Pruebas',
    environment_tag_production: 'Prod',
    tenant_info_saved: 'Información del inquilino guardada correctamente.',
  },
  deletion_card: {
    title: 'ELIMINAR',
    tenant_deletion: 'Eliminar inquilino',
    tenant_deletion_description:
      'Eliminar el inquilino resultará en la eliminación permanente de todos los datos de usuario y configuraciones asociadas. Por favor, proceda con precaución.',
    tenant_deletion_button: 'Eliminar inquilino',
  },
};

export default tenant_settings;
