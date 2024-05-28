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
  connector_status: 'Anmeldeoberfläche',
  connector_status_in_use: 'In Benutzung',
  connector_status_not_in_use: 'Nicht in Benutzung',
  not_in_use_tip: {
    content:
      'Nicht in Benutzung bedeutet, dass Ihre Anmeldeerfahrung diese Anmeldeoption nicht verwendet hat. <a>{{link}}</a>, um diese Anmeldeoption hinzuzufügen.',
    go_to_sie: 'Zur Anmeldeerfahrung gehen',
  },
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
    logo: 'Logo-URL für Social-Sign-In-Button',
    logo_placeholder: 'https://your.cdn.domain/logo.png',
    logo_tip:
      'Das Logobild wird auf dem Connector angezeigt. Holen Sie sich einen öffentlich zugänglichen Bildlink und fügen Sie den Link hier ein.',
    logo_dark: 'Logo-URL für Social-Sign-In-Button (Dark mode)',
    logo_dark_placeholder: 'https://your.cdn.domain/logo.png',
    logo_dark_tip:
      'Legen Sie das Logo Ihres Connectors für den Dark-Modus fest, nachdem Sie ihn in der Anmeldeerfahrung der Admin Konsole aktiviert haben.',
    logo_dark_collapse: 'Zusammenklappen',
    logo_dark_show: 'Logo-Einstellung für Dark-Modus anzeigen',
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
    callback_uri: 'Callback-URI',
    callback_uri_description:
      'Auch als Redirect-URI bezeichnet, ist die URI in Logto, zu der Benutzer nach der Social-Autorisierung zurückgesendet werden. Kopieren und fügen Sie sie in die Konfigurationsseite des Social Providers ein.',
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
};

export default Object.freeze(connectors);
