const organization_details = {
  page_title: 'Organisationsdetails',
  delete_confirmation:
    'Wenn gelöscht, verlieren alle Mitglieder ihre Mitgliedschaft und Rollen in dieser Organisation. Diese Aktion kann nicht rückgängig gemacht werden.',
  organization_id: 'Organisations-ID',
  settings_description:
    'Organisationen repräsentieren die Teams, Geschäftskunden und Partnerunternehmen, die auf Ihre Anwendungen zugreifen können.',
  name_placeholder: 'Der Name der Organisation, muss nicht eindeutig sein.',
  description_placeholder: 'Eine Beschreibung der Organisation.',
  member: 'Mitglied',
  member_other: 'Mitglieder',
  add_members_to_organization: 'Mitglieder zur Organisation {{name}} hinzufügen',
  add_members_to_organization_description:
    'Suchen Sie nach geeigneten Benutzern, indem Sie nach Name, E-Mail, Telefon oder Benutzer-ID suchen. In den Suchergebnissen werden keine bereits vorhandenen Mitglieder angezeigt.',
  add_with_organization_role: 'Mit Organisation Rollen hinzufügen',
  user: 'Benutzer',
  application: 'Anwendung',
  application_other: 'Anwendungen',
  add_applications_to_organization: 'Anwendungen zur Organisation {{name}} hinzufügen',
  add_applications_to_organization_description:
    'Suchen Sie nach passenden Anwendungen, indem Sie nach App-ID, Name oder Beschreibung suchen. Bereits vorhandene Anwendungen werden in den Suchergebnissen nicht angezeigt.',
  at_least_one_application: 'Mindestens eine Anwendung ist erforderlich.',
  remove_application_from_organization: 'Anwendung aus der Organisation entfernen',
  remove_application_from_organization_description:
    'Nach dem Entfernen verliert die Anwendung ihre Zuordnung und Rollen in dieser Organisation. Diese Aktion kann nicht rückgängig gemacht werden.',
  search_application_placeholder: 'Suche nach App-ID, Name oder Beschreibung',
  roles: 'Organisationsrollen',
  authorize_to_roles: 'Berechtige {{name}} auf die folgenden Rollen zuzugreifen:',
  edit_organization_roles: 'Organisationsrollen bearbeiten',
  edit_organization_roles_title: 'Organisationsrollen von {{name}} bearbeiten',
  remove_user_from_organization: 'Benutzer von der Organisation entfernen',
  remove_user_from_organization_description:
    'Wenn entfernt, verliert der Benutzer seine Mitgliedschaft und Rollen in dieser Organisation. Diese Aktion kann nicht rückgängig gemacht werden.',
  search_user_placeholder: 'Nach Name, E-Mail, Telefon oder Benutzer-ID suchen',
  at_least_one_user: 'Mindestens ein Benutzer ist erforderlich.',
  organization_roles_tooltip:
    'Die Rollen, die dem {{type}} innerhalb dieser Organisation zugewiesen sind.',
  custom_data: 'Benutzerdefinierte Daten',
  custom_data_tip:
    'Benutzerdefinierte Daten sind ein JSON-Objekt, das verwendet werden kann, um zusätzliche Daten zu speichern, die mit der Organisation verbunden sind.',
  invalid_json_object: 'Ungültiges JSON-Objekt.',
  branding: {
    logo: 'Organisationslogos',
    logo_tooltip:
      'Sie können die Organisations-ID übergeben, um dieses Logo im Anmeldeerlebnis anzuzeigen; die dunkle Version des Logos wird benötigt, wenn der Dunkelmodus in den Omni-Anmeldeerlebniseinstellungen aktiviert ist. <a>Mehr erfahren</a>',
  },
  jit: {
    title: 'Just-in-Time-Bereitstellung',
    description:
      'Benutzer können der Organisation automatisch beitreten und bei ihrer ersten Anmeldung über einige Authentifizierungsmethoden Rollen zugewiesen bekommen. Sie können Anforderungen festlegen, die für die Just-in-Time-Bereitstellung erfüllt werden müssen.',
    email_domain: 'E-Mail-Domain-Bereitstellung',
    email_domain_description:
      'Neue Benutzer, die sich mit ihren verifizierten E-Mail-Adressen oder über die soziale Anmeldung mit verifizierten E-Mail-Adressen anmelden, treten automatisch der Organisation bei. <a>Mehr erfahren</a>',
    email_domain_placeholder: 'E-Mail-Domains für die Just-in-Time-Bereitstellung eingeben',
    invalid_domain: 'Ungültige Domain',
    domain_already_added: 'Domain bereits hinzugefügt',
    sso_enabled_domain_warning:
      'Sie haben eine oder mehrere E-Mail-Domains eingegeben, die mit dem Enterprise SSO verknüpft sind. Benutzer mit diesen E-Mails folgen dem Standard-SSO-Fluss und werden dieser Organisation nicht bereitgestellt, es sei denn, das Enterprise SSO ist konfiguriert.',
    enterprise_sso: 'Enterprise SSO Bereitstellung',
    no_enterprise_connector_set:
      'Sie haben noch keinen Enterprise SSO-Connector eingerichtet. Fügen Sie zuerst Connectors hinzu, um die Enterprise SSO-Bereitstellung zu aktivieren. <a>Einrichten</a>',
    add_enterprise_connector: 'Enterprise-Connector hinzufügen',
    enterprise_sso_description:
      'Neue Benutzer oder bestehende Benutzer, die sich zum ersten Mal über Enterprise SSO anmelden, treten automatisch der Organisation bei. <a>Mehr erfahren</a>',
    organization_roles: 'Standard-Organisationsrollen',
    organization_roles_description:
      'Weisen Sie Benutzerrollen zu, wenn sie der Organisation durch die Just-in-Time-Bereitstellung beitreten.',
  },
  mfa: {
    title: 'Multi-Faktor-Authentifizierung (MFA)',
    tip: 'Wenn MFA erforderlich ist, werden Benutzer ohne MFA-Konfiguration abgelehnt, wenn sie versuchen, ein Organisationstoken auszutauschen. Diese Einstellung wirkt sich nicht auf die Benutzerauthentifizierung aus.',
    description:
      'Erfordern Sie, dass Benutzer die Multi-Faktor-Authentifizierung konfigurieren, um auf diese Organisation zuzugreifen.',
    no_mfa_warning:
      'Für Ihren Mandanten sind keine Multi-Faktor-Authentifizierungsmethoden aktiviert. Benutzer können nicht auf diese Organisation zugreifen, bis mindestens eine <a>Multi-Faktor-Authentifizierungsmethode</a> aktiviert ist.',
  },
};

export default Object.freeze(organization_details);
