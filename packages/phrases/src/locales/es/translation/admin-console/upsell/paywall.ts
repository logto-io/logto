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
    'Has alcanzado el límite de {{count, number}} roles de <planName/>. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  roles_other:
    'Has alcanzado el límite de {{count, number}} roles de <planName/>. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  machine_to_machine_roles:
    '{{count, number}} roles de máquina a máquina de <planName/> alcanzaron el límite. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  machine_to_machine_roles_other:
    '{{count, number}} roles de máquina a máquina de <planName/> alcanzaron el límite. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  scopes_per_role:
    'Has alcanzado el límite de {{count, number}} permisos por rol de <planName/>. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  scopes_per_role_other:
    'Has alcanzado el límite de {{count, number}} permisos por rol de <planName/>. Actualiza el plan para agregar roles y permisos adicionales. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  hooks:
    'Has alcanzado el límite de {{count, number}} webhooks de <planName/>. Actualiza el plan para crear más webhooks. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  hooks_other:
    'Has alcanzado el límite de {{count, number}} webhooks de <planName/>. Actualiza el plan para crear más webhooks. Si necesitas ayuda, no dudes en <a>contactarnos</a>.',
  mfa: 'Desbloquea MFA para verificar la seguridad al actualizar a un plan pago. No dudes en <a>contactarnos</a> si necesitas ayuda.',
  organizations:
    'Desbloquea las organizaciones al actualizar a un plan pago. No dudes en <a>contactarnos</a> si necesitas ayuda.',
  /** UNTRANSLATED */
  third_party_apps:
    'Unlock Logto as IdP for third-party apps by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  sso_connectors:
    'Unlock enterprise sso by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  tenant_members:
    'Unlock collaboration feature by upgrading to a paid plan. For any assistance, feel free to <a>contact us</a>.',
  /** UNTRANSLATED */
  tenant_members_dev_plan:
    "You've reached your {{limit}}-member limit. Release a member or revoke a pending invitation to add someone new. Need more seats? Feel free to contact us.",
};

export default Object.freeze(paywall);
