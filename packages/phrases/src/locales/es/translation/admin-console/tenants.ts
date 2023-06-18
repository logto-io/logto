const tenants = {
  create_modal: {
    title: 'Crear inquilino',
    subtitle: 'Cree un nuevo inquilino para separar recursos y usuarios.',
    create_button: 'Crear inquilino',
    tenant_name: 'Nombre del inquilino',
    tenant_name_placeholder: 'Mi inquilino',
    environment_tag: 'Etiqueta de ambiente',
    environment_tag_description:
      'Los servicios con diferentes etiquetas son idénticos. Funciona como sufijo para ayudar a su equipo a diferenciar entornos.',
    environment_tag_development: 'Dev',
    environment_tag_staging: 'Staging',
    environment_tag_production: 'Prod',
  },
  delete_modal: {
    title: 'Eliminar inquilino',
    description_line1:
      '¿Está seguro de que desea eliminar su inquilino "<span>{{name}}</span>" con etiqueta de sufijo de entorno"<span>{{tag}}</span>"? Esta acción no se puede deshacer y resultará en la eliminación permanente de todos sus datos e información de cuenta.',
    description_line2:
      'Antes de eliminar la cuenta, quizás podamos ayudarlo. <span><a>Contáctenos por correo electrónico</a></span>',
    description_line3:
      'Si desea continuar, ingrese el nombre del inquilino "<span>{{name}}</span>" para confirmar.',
    delete_button: 'Eliminar permanentemente',
  },
  tenant_landing_page: {
    title: 'Todavía no has creado un tenant',
    description:
      'Para empezar a configurar tu proyecto con Logto, por favor crea un nuevo tenant. Si necesitas cerrar la sesión o eliminar tu cuenta, simplemente haz clic en el botón de avatar en la esquina superior derecha.',
    create_tenant_button: 'Crear tenant',
  },
  tenant_created: "El inquilino '{{name}}' se ha creado correctamente.",
};

export default tenants;
