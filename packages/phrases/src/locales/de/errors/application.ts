const application = {
  invalid_type: 'Nur Maschinen-zu-Maschinen-Anwendungen können Rollen haben.',
  role_exists: 'Die Rolle mit der ID {{roleId}} wurde bereits dieser Anwendung hinzugefügt.',
  invalid_role_type:
    'Es ist nicht möglich, einer Maschinen-zu-Maschinen-Anwendung eine Benutzertyp-Rolle zuzuweisen.',
  invalid_third_party_application_type:
    'Nur traditionelle Webanwendungen können als Drittanbieter-App markiert werden.',
  third_party_application_only: 'Das Feature ist nur für Drittanbieter-Anwendungen verfügbar.',
  user_consent_scopes_not_found: 'Ungültige Benutzerzustimmungsbereiche.',
};

export default Object.freeze(application);
