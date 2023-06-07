const domain = {
  status: {
    connecting: 'Verbindung wird hergestellt',
    in_used: 'In Benutzung',
    failed_to_connect: 'Verbindung fehlgeschlagen',
  },
  update_endpoint_alert: {
    deleted: 'Benutzerdefinierte Domain erfolgreich gelöscht!',
    set_up: 'Ihre benutzerdefinierte Domain wurde erfolgreich eingerichtet.',
    update_tip:
      'Denken Sie daran, die für die Ressourcen zu verwendende Domain für den <social-link>{{socialLink}}</social-link> und <app-link>{{appLink}}</app-link> zu aktualisieren, wenn Sie die Ressourcen zuvor konfiguriert hatten.',
    callback_uri_text: 'Social-Connector-Callback-URI',
    application_text: 'Logto-Endpunkt für Ihre Anwendung',
  },
  error_hint:
    'Stellen Sie sicher, dass Sie Ihre DNS-Einträge aktualisiert haben. Wir werden alle {{value}} Sekunden weiter überprüfen.',
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
      'Nachdem Sie die DNS-Einträge konfiguriert haben, wird der Prozess automatisch ausgeführt und kann bis zu 24 Stunden dauern. Sie können diese Oberfläche verlassen während er läuft.',
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
        'Wenn Sie diese benutzerdefinierte Domain bereits in Ihrem Social-Connector-Provider oder Anwendungs-Endpunkt eingerichtet haben, müssen Sie die URI zur Logto-Standarddomain "<span>{{domain}}</span>" ändern. Dies ist notwendig, damit die Social-Sign-In-Schaltfläche ordnungsgemäß funktioniert.',
      deleted: 'Benutzerdefinierte Domain wurde erfolgreich gelöscht!',
    },
  },
  default: {
    default_domain: 'Standarddomain',
    default_domain_description:
      'Wir bieten einen Standard-Domainnamen an, der direkt online verwendet werden kann. Er ist immer verfügbar und stellt sicher, dass Ihre Anwendung immer für die Anmeldung erreichbar ist, auch wenn Sie auf eine benutzerdefinierte Domain umsteigen.',
    default_domain_field: 'Logto Standard-Domain',
  },
};

export default domain;
