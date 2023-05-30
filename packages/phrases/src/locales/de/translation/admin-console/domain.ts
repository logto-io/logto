const domain = {
  status: {
    connecting: 'Verbindung wird hergestellt',
    in_used: 'In Benutzung',
    failed_to_connect: 'Verbindung fehlgeschlagen',
  },
  update_endpoint_alert: {
    description:
      'Ihre benutzerdefinierte Domain wurde erfolgreich konfiguriert. Vergessen Sie nicht, die Domain zu aktualisieren, die Sie zuvor für die folgenden Ressourcen konfiguriert haben: {{domain}}.',
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
    custom_domain_placeholder: 'ihredomain.com',
    add_domain: 'Domain hinzufügen',
    invalid_domain_format: 'Ungültiges Format',
    steps: {
      add_records: {
        title: 'Fügen Sie die folgenden DNS-Einträge zu Ihrem DNS-Anbieter hinzu',
        generating_dns_records: 'Erzeuge die DNS-Einträge...',
        table: {
          type_field: 'Typ',
          name_field: 'Name',
          value_field: 'Wert',
        },
        finish_and_continue: 'Fertigstellen und Fortfahren',
      },
      verify_domain: {
        title: 'Verifizieren Sie die Verbindung der DNS-Einträge automatisch',
        description:
          'Der Prozess wird automatisch durchgeführt und kann einige Minuten (bis zu 24 Stunden) dauern. Sie können diese Schnittstelle verlassen, während sie ausgeführt wird.',
        error_message:
          'Verifizierung fehlgeschlagen. Bitte prüfen Sie Ihren Domainnamen oder DNS-Einträge.',
      },
      generate_ssl_cert: {
        title: 'Generieren Sie automatisch ein SSL-Zertifikat',
        description:
          'Der Prozess wird automatisch durchgeführt und kann einige Minuten (bis zu 24 Stunden) dauern. Sie können diese Schnittstelle verlassen, während sie ausgeführt wird.',
        error_message: 'SSL-Zertifizierung fehlgeschlagen. ',
      },
      enable_domain: 'Aktivieren Sie Ihre benutzerdefinierte Domain automatisch',
    },
    deletion: {
      delete_domain: 'Domain löschen',
      reminder: 'Benutzerdefinierte Domain löschen',
      description: 'Sind Sie sicher, dass Sie diese benutzerdefinierte Domain löschen möchten?',
      in_used_description:
        'Sind Sie sicher, dass Sie diese benutzerdefinierte Domain "{{domain}}" löschen möchten?',
      in_used_tip:
        'Wenn Sie diese benutzerdefinierte Domain zuvor in Ihrem sozialen Anbindungsanbieter oder Anwendungs-Endpunkt eingerichtet haben, müssen Sie die URI zuerst auf die Logto benutzerdefinierte Domain "{{domain}}" ändern. Dies ist notwendig, damit der soziale Anmelde-Button ordnungsgemäß funktioniert.',
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
