const tenants = {
  create_modal: {
    title: 'Crear inquilino',
    subtitle: 'Cree un nuevo inquilino para separar recursos y usuarios.',
    create_button: 'Crear inquilino',
    tenant_name: 'Nombre del inquilino',
    tenant_name_placeholder: 'Mi inquilino',
    environment_tag: 'Etiqueta de ambiente',
    environment_tag_description:
      'Use etiquetas para diferenciar los ambientes de uso del inquilino. Los servicios dentro de cada etiqueta son idénticos, lo que garantiza la coherencia.',
    environment_tag_development: 'Desarrollo',
    environment_tag_staging: 'Puesta en escena',
    environment_tag_production: 'Producción',
  },
  tenant_created: "El inquilino '{{name}}' se ha creado correctamente.",
};

export default tenants;
