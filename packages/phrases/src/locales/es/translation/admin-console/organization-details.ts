const organization_details = {
  page_title: 'Detalles de la organización',
  delete_confirmation:
    'Una vez eliminada, todos los miembros perderán su membresía y roles en esta organización. Esta acción no se puede deshacer.',
  organization_id: 'ID de la organización',
  settings_description:
    'Las organizaciones representan los equipos, clientes comerciales y empresas asociadas que pueden acceder a tus aplicaciones.',
  name_placeholder: 'El nombre de la organización, no es necesario que sea único.',
  description_placeholder: 'Una descripción de la organización.',
  member: 'Miembro',
  member_other: 'Miembros',
  add_members_to_organization: 'Agregar miembros a la organización {{name}}',
  add_members_to_organization_description:
    'Encuentra usuarios apropiados buscando nombre, correo electrónico, teléfono o ID de usuario. Los miembros existentes no se muestran en los resultados de búsqueda.',
  add_with_organization_role: 'Agregar con rol(es) de organización',
  user: 'Usuario',
  application: 'Aplicación',
  application_other: 'Aplicaciones',
  add_applications_to_organization: 'Agregar aplicaciones a la organización {{name}}',
  add_applications_to_organization_description:
    'Encuentra aplicaciones apropiadas buscando ID de la aplicación, nombre o descripción. Las aplicaciones existentes no se muestran en los resultados de búsqueda.',
  at_least_one_application: 'Se requiere al menos una aplicación.',
  remove_application_from_organization: 'Eliminar aplicación de la organización',
  remove_application_from_organization_description:
    'Una vez eliminada, la aplicación perderá su asociación y roles en esta organización. Esta acción no se puede deshacer.',
  search_application_placeholder: 'Buscar por ID de la aplicación, nombre o descripción',
  roles: 'Roles de la organización',
  authorize_to_roles: 'Autorizar a {{name}} para acceder a los siguientes roles:',
  edit_organization_roles: 'Editar roles de organización',
  edit_organization_roles_title: 'Editar roles de organización de {{name}}',
  remove_user_from_organization: 'Eliminar usuario de la organización',
  remove_user_from_organization_description:
    'Una vez eliminado, el usuario perderá su membresía y roles en esta organización. Esta acción no se puede deshacer.',
  search_user_placeholder: 'Buscar por nombre, correo electrónico, teléfono o ID de usuario',
  at_least_one_user: 'Se requiere al menos un usuario.',
  organization_roles_tooltip: 'Los roles asignados al {{type}} dentro de esta organización.',
  custom_data: 'Datos personalizados',
  custom_data_tip:
    'Los datos personalizados son un objeto JSON que se puede usar para almacenar datos adicionales asociados con la organización.',
  invalid_json_object: 'Objeto JSON no válido.',
  branding: {
    logo: 'Logotipos de la organización',
    logo_tooltip:
      'Puedes pasar el ID de la organización para mostrar este logotipo en la experiencia de inicio de sesión; se necesita la versión oscura del logotipo si se habilita el modo oscuro en la configuración de la experiencia de inicio de sesión omni. <a>Aprende más</a>',
  },
  jit: {
    title: 'Aprovisionamiento justo a tiempo',
    description:
      'Los usuarios pueden unirse automáticamente a la organización y recibir roles en su primer inicio de sesión a través de algunos métodos de autenticación. Puedes establecer requisitos para el aprovisionamiento justo a tiempo.',
    email_domain: 'Aprovisionamiento de dominio de correo electrónico',
    email_domain_description:
      'Los nuevos usuarios que se registren con sus direcciones de correo electrónico verificadas o a través de inicio de sesión social con direcciones de correo electrónico verificadas se unirán automáticamente a la organización. <a>Aprende más</a>',
    email_domain_placeholder:
      'Ingresa dominios de correo electrónico para aprovisionamiento justo a tiempo',
    invalid_domain: 'Dominio no válido',
    domain_already_added: 'Dominio ya agregado',
    sso_enabled_domain_warning:
      'Has ingresado uno o más dominios de correo electrónico asociados con SSO empresarial. Los usuarios con estos correos electrónicos seguirán el flujo estándar de SSO y no serán aprovisionados a esta organización a menos que se configure el aprovisionamiento SSO empresarial.',
    enterprise_sso: 'Aprovisionamiento SSO empresarial',
    no_enterprise_connector_set:
      'Aún no has configurado ningún conector SSO empresarial. Añade conectores primero para habilitar el aprovisionamiento SSO empresarial. <a>Configurar</a>',
    add_enterprise_connector: 'Añadir conector empresarial',
    enterprise_sso_description:
      'Los nuevos usuarios o los usuarios existentes que inicien sesión a través de SSO empresarial por primera vez se unirán automáticamente a la organización. <a>Aprende más</a>',
    organization_roles: 'Roles predeterminados de la organización',
    organization_roles_description:
      'Asignar roles a los usuarios al unirse a la organización a través del aprovisionamiento justo a tiempo.',
  },
  mfa: {
    title: 'Autenticación multifactor (MFA)',
    tip: 'Cuando se requiere MFA, los usuarios sin MFA configurada serán rechazados al intentar intercambiar un token de organización. Esta configuración no afecta la autenticación del usuario.',
    description:
      'Requiere que los usuarios configuren la autenticación multifactor para acceder a esta organización.',
    no_mfa_warning:
      'No hay métodos de autenticación multifactor habilitados para tu inquilino. Los usuarios no podrán acceder a esta organización hasta que se habilite al menos un <a>método de autenticación multifactor</a>.',
  },
};

export default Object.freeze(organization_details);
