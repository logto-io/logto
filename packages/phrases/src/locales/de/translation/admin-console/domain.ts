const domain = {
  status: {
    connecting: 'Verbindung wird hergestellt',
    in_used: 'In Benutzung',
    failed_to_connect: 'Verbindung fehlgeschlagen',
  },
  update_endpoint_alert: {
    description:
      'Ihre benutzerdefinierte Domain wurde erfolgreich konfiguriert. Vergessen Sie nicht, die Domain zu aktualisieren, die Sie zuvor für die folgenden Ressourcen konfiguriert haben: <span>{{domain}}</span>.',
    endpoint_url: 'Endpunkt-URL von <a>{{link}}</a>',
    application_settings_link_text: 'Anwendungseinstellungen',
    callback_url: 'Callback-URL von <a>{{link}}</a>',
    social_connector_link_text: 'Soziale Anbindung',
    api_identifier: 'API-Identifier von <a>{{link}}</a>',
    uri_management_api_link_text: 'URI-Verwaltungs-API',
    tip: 'Nach der Änderung der Einstellungen können Sie diese in unserem Anmeldungsprozess testen. <a>{{link}}</a>',
  },
  custom: {
    custom_domain: 'Benutzerdefinierte Domain',
    custom_domain_description:
      'Ersetzen Sie die Standarddomain durch Ihre eigene Domain, um die Konsistenz mit Ihrer Marke beizubehalten und die Anmeldeerfahrung für Benutzer zu personalisieren.',
    custom_domain_field: 'Benutzerdefinierte Domain',
    custom_domain_placeholder: 'ihre.domain.com',
    add_domain: 'Domain hinzufügen',
    invalid_domain_format:
      'Ungültiges Subdomänen-Format. Bitte geben Sie eine Subdomäne mit mindestens drei Teilen ein.',
    verify_domain: 'Domain überprüfen',
    enable_ssl: 'SSL aktivieren',
    checking_dns_tip:
      'Nachdem Sie die DNS-Einträge konfiguriert haben, wird der Prozess automatisch ausgeführt und kann bis zu 24 Stunden dauern. Sie können diese Oberfläche verlassen während es läuft.',
    generating_dns_records: 'DNS-Einträge werden generiert...',
    add_dns_records: 'Bitte fügen Sie diese DNS-Einträge Ihrem DNS-Provider hinzu.',
    dns_table: {
      type_field: 'Typ',
      name_field: 'Name',
      value_field: 'Wert',
    },
    deletion: {
      delete_domain: 'Domain löschen',
      reminder: 'Benutzerdefinierte Domain löschen',
      description: 'Sind Sie sicher, dass Sie diese benutzerdefinierte Domain löschen möchten?',
      in_used_description:
        'Sind Sie sicher, dass Sie diese benutzerdefinierte Domain "<span>{{domain}}</span>" löschen möchten?',
      in_used_tip:
        'Wenn Sie diese benutzerdefinierte Domain bereits in Ihrem Social-Connector-Provider oder Anwendungs-Endpunkt eingerichtet haben, müssen Sie die URI zu der Logto-Standarddomain "<span>{{domain}}</span>" ändern. Dies ist notwendig, damit die Social-Sign-In-Schaltfläche ordnungsgemäß funktioniert.',
      deleted: 'Benutzerdefinierte Domain wurde erfolgreich gelöscht!',
    },
  },
  default: {
    default_domain: 'Standarddomain',
    default_domain_description:
      'Wir bieten einen Standard-Domainnamen an, der direkt online verwendet werden kann. Es ist immer verfügbar und stellt sicher, dass Ihre Anwendung immer für die Anmeldung erreichbar ist, auch wenn Sie auf eine benutzerdefinierte Domain umsteigen.',
    default_domain_field: 'Logto Standard-Domain',
  },
};

export default domain;
