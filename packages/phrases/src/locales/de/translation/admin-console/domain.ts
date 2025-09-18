const domain = {
  status: {
    connecting: 'Verbindung wird hergestellt...',
    in_use: 'In Benutzung',
    failed_to_connect: 'Verbindung fehlgeschlagen',
  },
  update_endpoint_notice:
    'Vergessen Sie nicht, die Domain für die Social-Connector-Callback-URI und den Logto-Endpunkt in Ihrer Anwendung zu aktualisieren, wenn Sie eine benutzerdefinierte Domain für die Funktionen verwenden möchten.',
  error_hint:
    'Stellen Sie sicher, dass Sie Ihre DNS-Einträge aktualisiert haben. Wir werden alle {{value}} Sekunden weiter überprüfen.',
  custom: {
    custom_domain: 'Benutzerdefinierte Domain',
    custom_domain_description:
      'Verbessern Sie Ihre Markenbildung durch die Verwendung einer benutzerdefinierten Domain. Diese Domain wird in Ihrem Anmeldeerlebnis verwendet.',
    custom_domain_field: 'Benutzerdefinierte Domains',
    custom_domain_placeholder: 'ihre.domain.com',
    add_custom_domain_field: 'Benutzerdefinierte Domain hinzufügen',
    custom_domains_field: 'Benutzerdefinierte Domains',
    add_domain: 'Domain hinzufügen',
    invalid_domain_format:
      'Bitte geben Sie eine gültige Domain-URL mit mindestens drei Teilen an, z. B. "auth.domain.com."',
    verify_domain: 'Domain überprüfen',
    enable_ssl: 'SSL aktivieren',
    checking_dns_tip:
      'Nachdem Sie die DNS-Einträge konfiguriert haben, wird der Prozess automatisch ausgeführt und kann bis zu 24 Stunden dauern. Sie können diese Oberfläche verlassen, während er läuft.',
    enable_ssl_tip:
      'SSL aktivieren wird automatisch ausgeführt und kann bis zu 24 Stunden dauern. Sie können diese Oberfläche verlassen, während er läuft.',
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
    config_custom_domain_description:
      'Konfigurieren Sie benutzerdefinierte Domains, um folgende Funktionen einzurichten: Anwendungen, Social‑Connectoren und Enterprise‑Connectoren (OIDC).',
  },
  default: {
    default_domain: 'Standarddomain',
    default_domain_description:
      'Logto bietet eine vorkonfigurierte Standarddomain, die ohne zusätzliche Einrichtung verwendet werden kann. Diese Standarddomain dient als Backup-Option, auch wenn Sie eine benutzerdefinierte Domain aktiviert haben.',
    default_domain_field: 'Logto Standard-Domain',
  },
  custom_endpoint_note:
    'Sie können den Domainnamen dieser Endpunkte anpassen, wie Sie möchten. Wählen Sie entweder "{{custom}}" oder "{{default}}".',
  custom_social_callback_url_note:
    'Sie können den Domainnamen dieser URI anpassen, um mit dem Endpunkt Ihrer Anwendung übereinzustimmen. Wählen Sie entweder "{{custom}}" oder "{{default}}".',
  custom_acs_url_note:
    'Sie können den Domainnamen dieser URI anpassen, um mit der URL Ihres Identitätsanbieters Assertions-Verbraucherdienst übereinzustimmen. Wählen Sie entweder "{{custom}}" oder "{{default}}".',
  switch_custom_domain_tip:
    'Wechseln Sie die Domain, um den entsprechenden Endpunkt anzuzeigen. Fügen Sie über <a>benutzerdefinierte Domains</a> weitere Domains hinzu.',
  switch_saml_app_domain_tip:
    'Wechseln Sie die Domain, um die entsprechenden URLs anzuzeigen. Bei SAML‑Protokollen können Metadaten‑URLs auf jeder erreichbaren Domain gehostet werden. Die ausgewählte Domain bestimmt jedoch die SSO-Service-URL, über die SPs Endbenutzer zur Authentifizierung umleiten – dies beeinflusst das Anmeldeerlebnis und die Sichtbarkeit der URL.',
  switch_saml_connector_domain_tip:
    'Wechseln Sie die Domain, um die entsprechenden URLs anzuzeigen. Die ausgewählte Domain bestimmt Ihre ACS-URL und damit wohin Nutzer nach dem SSO-Login weitergeleitet werden. Wählen Sie die Domain, die dem erwarteten Weiterleitungsverhalten Ihrer Anwendung entspricht.',
};

export default Object.freeze(domain);
