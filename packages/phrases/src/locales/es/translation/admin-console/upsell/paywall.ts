const paywall = {
  applications:
    'Se ha alcanzado el límite de {{count, number}} aplicación de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. Para cualquier ayuda, no dudes en <a>contactarnos</a>.',
  applications_other:
    'Se ha alcanzado el límite de {{count, number}} aplicaciones de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. Para cualquier ayuda, no dudes en <a>contactarnos</a>.',
  machine_to_machine_feature:
    'Cambia al plan <strong>Pro</strong> para obtener aplicaciones adicionales de máquina a máquina y disfrutar de todas las funciones premium. <a>Contáctanos</a> si tienes preguntas.',
  machine_to_machine:
    'Se ha alcanzado el límite de {{count, number}} aplicación de máquina a máquina de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. Para cualquier ayuda, no dudes en <a>contactarnos</a>.',
  machine_to_machine_other:
    'Se ha alcanzado el límite de {{count, number}} aplicaciones de máquina a máquina de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. Para cualquier ayuda, no dudes en <a>contactarnos</a>.',
  resources:
    'Has alcanzado el límite de {{count, number}} recursos de API de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. <a>Contáctanos</a> si necesitas asistencia.',
  resources_other:
    'Has alcanzado el límite de {{count, number}} recursos de API de <planName/>. Actualiza el plan para satisfacer las necesidades de tu equipo. <a>Contáctanos</a> si necesitas asistencia.',
  scopes_per_resource:
    'Has alcanzado el límite de {{count, number}} permisos por recurso de API de <planName/>. Actualiza ahora para expandirlo. <a>Contáctanos</a> si necesitas asistencia.',
  scopes_per_resource_other:
    'Has alcanzado el límite de {{count, number}} permisos por recurso de API de <planName/>. Actualiza ahora para expandirlo. <a>Contáctanos</a> si necesitas asistencia.',
  custom_domain:
    'Desbloquea la funcionalidad de dominio personalizado al actualizar al plan <strong>Hobby</strong> o <strong>Pro</strong>. No dudes en <a>contactarnos</a> si necesitas ayuda.',
  social_connectors:
    'Has alcanzado el límite de {{count, number}} conectores sociales de <planName/>. Actualiza el plan para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  social_connectors_other:
    'Has alcanzado el límite de {{count, number}} conectores sociales de <planName/>. Actualiza el plan para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  standard_connectors_feature:
    'Actualiza al plan <strong>Hobby</strong> o <strong>Pro</strong> para crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML, además de conectores sociales ilimitados y todas las funciones premium. No dudes en <a>contactarnos</a> si necesitas ayuda.',
  standard_connectors:
    'Has alcanzado el límite de {{count, number}} conectores sociales de <planName/>. Actualiza el plan para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  standard_connectors_other:
    'Has alcanzado el límite de {{count, number}} conectores sociales de <planName/>. Actualiza el plan para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  standard_connectors_pro:
    'Has alcanzado el límite de {{count, number}} conectores estándar de <planName/>. Actualiza al plan Enterprise para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  standard_connectors_pro_other:
    'Has alcanzado el límite de {{count, number}} conectores estándar de <planName/>. Actualiza al plan Enterprise para obtener conectores sociales adicionales y la capacidad de crear tus propios conectores usando los protocolos OIDC, OAuth 2.0 y SAML. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  roles:
    'Actualiza el plan para agregar roles y permisos adicionales. No dudes en <a>contactarnos</a> si necesitas ayuda.',
  scopes_per_role:
    'Has alcanzado el límite de {{count, number}} permisos por rol de <planName/>. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  scopes_per_role_other:
    'Has alcanzado el límite de {{count, number}} permisos por rol de <planName/>. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  saml_applications_oss:
    'La aplicación SAML adicional está disponible con el plan Logto Enterprise. Contáctanos si necesitas asistencia.',
  logto_pricing_button_text: 'Precios de Logto Cloud',
  saml_applications:
    'La aplicación SAML adicional está disponible con el plan Logto Enterprise. Contáctanos si necesitas asistencia.',
  saml_applications_add_on:
    'Desbloquea la función de la aplicación SAML al actualizar a un plan pago. Para cualquier asistencia, no dudes en <a>contactarnos</a>.',
  hooks:
    'Has alcanzado el límite de {{count, number}} webhooks de <planName/>. Actualiza el plan para crear más webhooks. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  hooks_other:
    'Has alcanzado el límite de {{count, number}} webhooks de <planName/>. Actualiza el plan para crear más webhooks. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  mfa: 'Desbloquea MFA para verificar la seguridad al actualizar a un plan pago. No dudes en <a>contactarnos</a> si necesitas ayuda.',
  organizations:
    'Desbloquea las organizaciones al actualizar a un plan pago. No dudes en <a>contactarnos</a> si necesitas ayuda.',
  third_party_apps:
    'Desbloquea Logto como proveedor de identidades para aplicaciones de terceros al actualizar a un plan de pago. Para cualquier asistencia, no dudes en <a>contactarnos</a>.',
  sso_connectors:
    'Desbloquea el SSO empresarial al actualizar a un plan de pago. Para cualquier asistencia, no dudes en <a>contactarnos</a>.',
  tenant_members:
    'Desbloquea la función de colaboración al actualizar a un plan de pago. Para cualquier asistencia, no dudes en <a>contactarnos</a>.',
  tenant_members_dev_plan:
    'Has alcanzado tu límite de {{limit}} miembros. Libera a un miembro o revoca una invitación pendiente para agregar a alguien nuevo. ¿Necesitas más puestos? No dudes en contactarnos.',
  custom_jwt: {
    title: 'Agregar reclamaciones personalizadas',
    description:
      'Actualiza a un plan de pago para obtener funcionalidades personalizadas de JWT y beneficios premium. No dudes en <a>contactarnos</a> si tienes alguna pregunta.',
  },
  bring_your_ui:
    'Actualiza a un plan de pago para traer tu funcionalidad UI personalizada y beneficios premium.',
  security_features:
    'Desbloquea funciones de seguridad avanzadas al actualizar al plan Pro. No dudes en <a>contactarnos</a> si tienes alguna pregunta.',
  collect_user_profile:
    'Actualiza a un plan de pago para recopilar información adicional del perfil de usuario durante el registro. No dudes en <a>contactarnos</a> si tienes alguna pregunta.',
};

export default Object.freeze(paywall);
