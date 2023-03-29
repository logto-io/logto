const auth = {
  authorization_header_missing: 'Autorisierungs-Header fehlt.',
  authorization_token_type_not_supported: 'Autorisierungs-Typ wird nicht unterstützt.',
  unauthorized: 'Unautorisiert. Bitte überprüfe deine Zugangsdaten.',
  forbidden: 'Verboten. Bitte überprüfe deine Rollen und Berechtigungen.',
  expected_role_not_found:
    'Erwartete Rolle nicht gefunden. Bitte überprüfe deine Rollen und Berechtigungen.',
  jwt_sub_missing: '`sub` fehlt in JWT.',
  require_re_authentication:
    'Zur Durchführung einer geschützten Aktion ist eine erneute Authentifizierung erforderlich.',
};
export default auth;
