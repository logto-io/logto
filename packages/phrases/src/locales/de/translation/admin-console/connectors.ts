const connectors = {
  page_title: 'Connectoren',
  title: 'Connectoren',
  subtitle: 'Richte Connectoren ein, um passwortlose und Social-Anmeldung zu aktivieren',
  create: 'Social-Connector erstellen',
  config_sie_notice:
    'Sie haben Connectoren eingerichtet. Stellen Sie sicher, dass Sie ihn in <a>{{link}}</a> konfigurieren.',
  config_sie_link_text: 'Anmeldeerfahrung',
  tab_email_sms: 'E-Mail und SMS-Connectoren',
  tab_social: 'Social-Connectoren',
  connector_name: 'Connector-Name',
  demo_tip:
    'Die maximale Anzahl von Nachrichten für diesen Demo-Connector ist auf 100 begrenzt und wird nicht für den Einsatz in einer Produktionsumgebung empfohlen.',
  social_demo_tip:
    'Der Demo-Connector ist ausschließlich für Demonstrationszwecke konzipiert und wird nicht für den Einsatz in einer Produktionsumgebung empfohlen.',
  connector_type: 'Typ',
  placeholder_title: 'Social-Connector',
  placeholder_description:
    'Logto hat viele weit verbreitete Social-Sign-In-Connectoren bereitgestellt. Inzwischen können Sie mit Standardprotokollen Ihre eigenen erstellen.',
  save_and_done: 'Speichern und fertigstellen',
  type: {
    email: 'E-Mail-Connector',
    sms: 'SMS-Connector',
    social: 'Social-Connector',
  },
  setup_title: {
    email: 'E-Mail-Connector einrichten',
    sms: 'SMS-Connector einrichten',
    social: 'Social-Connector erstellen',
  },
  guide: {
    subtitle: 'Eine Schritt-für-Schritt-Anleitung zur Konfiguration deines Connectors',
    general_setting: 'Allgemeine Einstellungen',
    parameter_configuration: 'Parameterkonfiguration',
    test_connection: 'Verbindungstest',
    name: 'Name für Social-Sign-In-Button',
    name_placeholder: 'Geben Sie den Namen für den Social-Sign-In-Button ein',
    name_tip:
      'Der Name des Connector-Buttons wird als "Weiter mit {{name}}" angezeigt. Achten Sie darauf, dass der Name nicht zu lang wird.',
    connector_logo: 'Connector-Logo',
    connector_logo_tip: 'Das Logo wird auf dem Connector-Anmeldebutton angezeigt.',
    target: 'Identity Provider Name',
    target_placeholder: 'Geben Sie den Namen des Connector Identity Providers ein',
    target_tip:
      'Der Wert von "IdP-Name" kann eine eindeutige Kennung sein, um Ihre Social-Identitäten zu unterscheiden.',
    target_tip_standard:
      'Der Wert von "IdP-Name" kann eine eindeutige Kennung sein, um Ihre Social-Identitäten zu unterscheiden. Diese Einstellung kann nach der Erstellung des Connectors nicht mehr geändert werden.',
    target_tooltip:
      '„Target“ in Logto-Social-Connectors bezieht sich auf die „Quelle“ Ihrer Social-Identitäten. Im Logto-Design akzeptieren wir nicht dasselbe „Target“ einer bestimmten Plattform, um Konflikte zu vermeiden. Sie sollten sehr vorsichtig sein, bevor Sie einen Connector hinzufügen, da Sie seinen Wert NICHT ändern können, sobald Sie ihn erstellt haben. <a>Erfahren Sie mehr</a>',
    target_conflict:
      'Der eingegebene IdP-Name stimmt mit dem vorhandenen <span>Namen</span> überein. Die Verwendung desselben IdP-Namens kann ein unerwartetes Anmeldeverhalten verursachen, bei dem Benutzer über zwei verschiedene Connectoren auf dasselbe Konto zugreifen können.',
    target_conflict_line2:
      'Wenn Sie den aktuellen Connector durch denselben Identity Provider ersetzen und früheren Benutzern ermöglichen möchten, sich ohne erneute Registrierung anzumelden, löschen Sie bitte den <span>Namen</span>-Connector und erstellen Sie einen neuen mit dem gleichen "IdP-Namen".',
    target_conflict_line3:
      'Wenn Sie sich mit einem anderen Identity Provider verbinden möchten, ändern Sie bitte den "IdP-Name" und fahren Sie fort.',
    config: 'Geben Sie Ihre Konfigurations-JSON ein',
    sync_profile: 'Profilinformationen synchronisieren',
    sync_profile_only_at_sign_up: 'Nur bei der Anmeldung synchronisieren',
    sync_profile_each_sign_in: 'Bei jeder Anmeldung immer synchronisieren',
    sync_profile_tip:
      'Synchronisieren Sie das Grundprofil vom Social-Provider, z. B. die Namen der Benutzer und ihre Avatare.',
    enable_token_storage: {
      title: 'Speicher Tokens für dauerhaften API-Zugriff',
      description:
        'Speichern Sie Zugriffs- und Auffrischungstokens im Secret Vault. Ermöglicht automatisierte API-Aufrufe ohne wiederholte Zustimmung der Benutzer. Beispiel: Lassen Sie Ihren AI-Agenten Ereignisse mit dauerhafter Genehmigung zu Google Kalender hinzufügen. <a>Erfahren Sie, wie man Drittanbieter-APIs aufruft</a>',
    },
    callback_uri: 'Redirect-URI (Callback-URI)',
    callback_uri_description:
      'Die Redirect-URI ist die Adresse, zu der Benutzer nach der Social-Autorisierung zurückgeleitet werden. Fügen Sie diese URI zur Konfiguration Ihres IdP hinzu.',
    callback_uri_custom_domain_description:
      'Wenn Sie in Logto mehrere <a>benutzerdefinierte Domains</a> verwenden, fügen Sie alle entsprechenden Callback-URIs zu Ihrem IdP hinzu, damit Social Login in jeder Domain funktioniert.\n\nDie standardmäßige Logto-Domain (*.logto.app) ist immer gültig - fügen Sie sie nur hinzu, wenn Sie auch Anmeldungen unter dieser Domain unterstützen möchten.',
    acs_url: 'Assertion Consumer Service URL',
  },
  platform: {
    universal: 'Universal',
    web: 'Web',
    native: 'Nativ',
  },
  add_multi_platform: ' unterstützt mehrere Plattformen. Wähle eine Plattform aus, um fortzufahren',
  drawer_title: 'Connector-Anleitung',
  drawer_subtitle: 'Folge den Anweisungen, um deinen Connector zu integrieren',
  unknown: 'Unbekannter Connector',
  standard_connectors: 'Standard-Connectoren',
  create_form: {
    third_party_connectors:
      'Integrieren Sie Drittanbieter für schnelles Social-Login, Verknüpfung von Social-Konten und API-Zugriff. <a>Erfahren Sie mehr</a>',
    standard_connectors:
      'Oder Sie können Ihren Social Connector mit einem Standardprotokoll anpassen.',
  },
};

export default Object.freeze(connectors);
