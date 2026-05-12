import content from './content.js';
import custom_profile_fields from './custom-profile-fields.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Anmeldeoberfläche',
  page_title_with_account: 'Anmeldung & Konto',
  title: 'Anmeldung & Konto',
  description:
    'Passen Sie die Authentifizierungsabläufe und die Benutzeroberfläche an, und sehen Sie sich das Erlebnis sofort an.',
  tabs: {
    branding: 'Branding',
    sign_up_and_sign_in: 'Anmeldung und Registrierung',
    collect_user_profile: 'Benutzerprofil sammeln',
    account_center: 'Account Center',
    content: 'Inhalt',
    password_policy: 'Passwortrichtlinie',
  },
  welcome: {
    title: 'Anmeldungs-Erlebnis anpassen',
    description:
      'Setze schnell deine erste Anmeldung ein. Dieser Leitfaden führt dich durch alle notwendigen Einstellungen.',
    get_started: 'Erste Schritte',
    apply_remind:
      'Bitte beachte, dass die Anmeldeoberfläche für alle Anwendungen unter diesem Konto gilt.',
  },
  color: {
    title: 'FARBE',
    primary_color: 'Markenfarbe',
    dark_primary_color: 'Markenfarbe (Dunkler Modus)',
    dark_mode: 'Aktiviere Dunklen Modus',
    dark_mode_description:
      'Deine App erhält einen automatisch generierten Dunklen Modus, der auf deiner Markenfarbe und dem Logto-Algorithmus basiert. Du kannst diesen nach Belieben anpassen.',
    dark_mode_reset_tip: 'Neuberechnung der Farbe des dunklen Modus basierend auf der Markenfarbe.',
    reset: 'Neuberechnen',
  },
  branding: {
    title: 'BRANDING',
    ui_style: 'Stil',
    with_light: '{{value}}',
    with_dark: '{{value}} (dark)',
    app_logo_and_favicon: 'App-Logo und Favicon',
    company_logo_and_favicon: 'Firmenlogo und Favicon',
    organization_logo_and_favicon: 'Organisationslogo und Favicon',
    hide_logto_branding: 'Logto-Branding ausblenden',
    hide_logto_branding_description:
      'Entferne "Powered by Logto". Präsentiere deine Marke exklusiv mit einer klaren, professionellen Anmeldeerfahrung.',
    hide_logto_branding_oss_note: 'Diese Funktion ist nativ in <a>Logto Cloud</a> verfügbar.',
  },
  branding_uploads: {
    app_logo: {
      title: 'App-Logo',
      url: 'App-Logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'App-Logo: {{error}}',
    },
    company_logo: {
      title: 'Firmenlogo',
      url: 'Firmenlogo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Firmenlogo: {{error}}',
    },
    organization_logo: {
      title: 'Bild hochladen',
      url: 'Organisations-Logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Organisations-Logo: {{error}}',
    },
    connector_logo: {
      title: 'Bild hochladen',
      url: 'Konnektor-Logo URL',
      url_placeholder: 'https://your.cdn.domain/logo.png',
      error: 'Konnektor-Logo: {{error}}',
    },
    favicon: {
      title: 'Favicon',
      url: 'Favicon URL',
      url_placeholder: 'https://your.cdn.domain/favicon.ico',
      error: 'Favicon: {{error}}',
    },
  },
  custom_ui: {
    title: 'Benutzerdefinierte UI',
    cloud_tag: 'Cloud',
    css_code_editor_title: 'Benutzerdefiniertes CSS',
    css_code_editor_description1: 'Siehe das Beispiel für benutzerdefiniertes CSS.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Erfahre mehr',
    css_code_editor_content_placeholder:
      'Geben Sie Ihr benutzerdefiniertes CSS ein, um die Stile nach Ihren exakten Spezifikationen anzupassen. Drücken Sie Ihre Kreativität aus und heben Sie Ihre Benutzeroberfläche hervor.',
    bring_your_ui_title: 'Bringen Sie Ihr UI',
    bring_your_ui_description:
      'Laden Sie ein komprimiertes Paket (.zip) hoch, um die vorgefertigte Benutzeroberfläche von Logto durch Ihren eigenen Code zu ersetzen. <a>Erfahren Sie mehr</a>',
    bring_your_ui_oss_description: 'Passen Sie die Anmeldeoberfläche mit Ihrem eigenen Code an.',
    bring_your_ui_oss_card_description:
      'Laden Sie Ihre benutzerdefinierte Anmeldeoberfläche direkt in <a>Logto Cloud</a> hoch. Kein Fork und kein erneutes Deployment erforderlich.',
    bring_your_ui_oss_try_cloud: 'Cloud ausprobieren',
    preview_with_bring_your_ui_description:
      'Ihre benutzerdefinierten UI-Assets wurden erfolgreich hochgeladen und werden jetzt bereitgestellt. Daher wurde das eingebaute Vorschaufenster deaktiviert.\nUm Ihre personalisierte Anmelde-Benutzeroberfläche zu testen, klicken Sie auf die Schaltfläche "Live-Vorschau", um sie in einem neuen Browser-Tab zu öffnen.',
    csp_description:
      'Erlauben Sie zusätzliche Quellausdrücke für Ihre benutzerdefinierte Anmeldeoberfläche. Diese Werte werden nur angewendet, wenn benutzerdefinierte UI-Assets bereitgestellt werden.',
    csp_script_src: 'script-src-Quellen',
    csp_script_src_tip:
      'Erlauben Sie HTTPS-Quellausdrücke für Skripte, die von Ihrer benutzerdefinierten UI geladen werden, z. B. https://scripts.example.com oder https://*.example.com.',
    csp_connect_src: 'connect-src-Quellen',
    csp_connect_src_tip:
      'Erlauben Sie HTTPS- oder WSS-Quellausdrücke für Netzwerkanfragen Ihrer benutzerdefinierten UI, z. B. https://api.example.com oder wss://events.example.com.',
    csp_source_invalid_error:
      'Geben Sie einen gültigen Quellausdruck ein. Verwenden Sie https://-URLs; connect-src unterstützt auch wss://. CSP-Schlüsselwörter und Semikolons werden nicht unterstützt.',
    csp_source_duplicate_error: 'Dieser Quellausdruck ist bereits aufgeführt.',
  },
  account_center: {
    title: 'KONTOZENTRUM',
    description: 'Passen Sie Ihre Kontozentrums-Workflows mit den Logto-APIs an.',
    enable_account_api: 'Kontozentrum und Account-API aktivieren',
    enable_account_api_description:
      'Aktiviert sowohl die benutzerseitige Account-API als auch das vorgefertigte Kontocenter von Logto. Wenn dies deaktiviert ist, sind beide Funktionen nicht verfügbar.',
    field_options: {
      off: 'Aus',
      edit: 'Bearbeiten',
      read_only: 'Nur lesen',
      enabled: 'Aktiviert',
      disabled: 'Deaktiviert',
    },
    sections: {
      account_security: {
        title: 'KONTO-SICHERHEIT',
        description:
          'Verwalten Sie den Zugriff auf die Account-API, damit Benutzer nach der Anmeldung Identitätsinformationen und Authentifizierungsfaktoren anzeigen oder bearbeiten können.',
        security_verification: {
          title: 'Sicherheitsüberprüfung',
          description:
            'Bevor Sicherheitseinstellungen geändert werden, müssen Benutzer ihre Identität verifizieren und eine 10 Minuten gültige Verifizierungs-ID erhalten. Um eine Verifizierungsmethode (E-Mail, Telefon, Passwort) zu aktivieren, setzen Sie die Account-API-Berechtigung unten auf <strong>Nur lesen</strong> (Minimum) oder <strong>Bearbeiten</strong>, damit das System erkennen kann, ob der Benutzer sie konfiguriert hat. <a>Mehr erfahren</a>',
        },
        groups: {
          identifiers: {
            title: 'Identifikatoren',
          },
          authentication_factors: {
            title: 'Authentifizierungsfaktoren',
          },
          session_management: {
            title: 'Sitzungsverwaltung',
          },
        },
      },
      user_profile: {
        title: 'BENUTZERPROFIL',
        description:
          'Verwalten Sie den Zugriff auf die Account-API, damit Benutzer nach der Anmeldung Basis- oder benutzerdefinierte Profildaten anzeigen oder bearbeiten können.',
        groups: {
          profile_data: {
            title: 'Profildaten',
          },
        },
      },
      secret_vault: {
        title: 'GEHEIMER TRESOR',
        description:
          'Speichern Sie für soziale und Enterprise-Konnektoren Drittanbieter-Zugriffstoken sicher, um deren APIs aufzurufen (z. B. Ereignisse zum Google Kalender hinzufügen).',
        third_party_token_storage: {
          title: 'Token von Drittanbietern',
          third_party_access_token_retrieval: 'Abruf von Drittanbieter-Zugriffstoken',
          third_party_token_tooltip:
            'Um Token zu speichern, können Sie diese Option in den Einstellungen des jeweiligen Social- oder Enterprise-Konnektors aktivieren.',
          third_party_token_description:
            'Sobald die Account-API aktiviert ist, wird der Abruf von Drittanbieter-Token automatisch freigeschaltet.',
        },
      },
    },
    fields: {
      email: 'E-Mail-Adresse',
      phone: 'Telefonnummer',
      social: 'Soziale Identitäten',
      password: 'Passwort',
      mfa: 'Multi-Faktor-Authentifizierung',
      mfa_description: 'Erlauben Sie Nutzern, ihre MFA-Methoden im Kontozentrum zu verwalten.',
      username: 'Benutzername',
      name: 'Name',
      avatar: 'Avatar',
      profile: 'Profil',
      profile_description: 'Steuern Sie den Zugriff auf strukturierte Profilattribute.',
      custom_data: 'Benutzerdefinierte Daten',
      custom_data_description:
        'Steuern Sie den Zugriff auf benutzerdefinierte JSON-Daten, die beim Benutzer gespeichert sind.',
      sessions: 'Sitzungen',
    },
    profile_fields: {
      title: 'Profilfelder für vorgefertigtes Konto-Center',
      add_profile_fields: 'Profilfelder hinzufügen',
      hint: {
        not_in_list: 'Nicht in der Liste?',
        set_up: 'Jetzt einrichten',
        go_to: 'andere Profilfelder.',
      },
      disabled_hint: {
        name: 'Um dieses Feld hinzuzufügen, setze zuerst die Berechtigung „Name“ im obigen Bereich „Profildaten“ auf „Bearbeiten/Nur lesen“.',
        avatar:
          'Um dieses Feld hinzuzufügen, setze zuerst die Berechtigung „Avatar“ im obigen Bereich „Profildaten“ auf „Bearbeiten/Nur lesen“.',
        profile:
          'Um dieses Feld hinzuzufügen, setze zuerst die Berechtigung „Profil“ im obigen Bereich „Profildaten“ auf „Bearbeiten/Nur lesen“.',
        custom_data:
          'Um dieses Feld hinzuzufügen, setze zuerst die Berechtigung „Benutzerdefinierte Daten“ im obigen Bereich „Profildaten“ auf „Bearbeiten/Nur lesen“.',
      },
    },
    webauthn_related_origins: 'WebAuthn-bezogene Ursprünge',
    webauthn_related_origins_description:
      'Fügen Sie die Domains Ihrer Frontend-Anwendungen hinzu, die über die Account-API Passkeys registrieren dürfen.',
    webauthn_related_origins_error: 'Der Ursprung muss mit https:// oder http:// beginnen',
    delete_account_url: 'Konto löschen',
    delete_account_url_description:
      'Geben Sie Ihre eigene Endpunkt-URL an, um die Kontolöschung mit benutzerdefinierter Logik zu verarbeiten.',
    prebuilt_ui: {
      title: 'INTEGRATE PREBUILT UI',
      description:
        'Integrieren Sie schnell vorgefertigte Kontocenter, Sicherheitsverifizierungen oder einzelne Profilaktualisierungsabläufe mit vorgefertigter Benutzeroberfläche. Kombinieren Sie einfach Ihre Domain mit der Route, um Ihre Kontocenter-URL zu bilden (z. B. https://auth.foo.com/account/email).',
      permission_notice:
        'Um diese vorgefertigten Flows zu integrieren, setzen Sie die entsprechenden Account-API-Berechtigungen in den Einstellungen unten auf <strong>Bearbeiten</strong>.',
      account_center_title: 'Vorgefertigtes Kontocenter integrieren',
      account_center_description:
        'Leiten Sie Benutzer zum Kontocenter, um Sicherheitseinstellungen wie E-Mail, Telefon, Benutzername, Passwort, MFA und verbundene Konten zu verwalten.',
      flows_title: 'Vorgefertigte Sicherheits-Einstellungen integrieren',
      single_task_flows_title: 'Vorgefertigten Einzelaufgaben-Ablauf integrieren',
      flows_description:
        'Kombinieren Sie Ihre Domain mit der Route, um Ihre Konto-Einstellungs-URL zu bilden (z. B. https://auth.foo.com/account/email). Optional können Sie `redirect=` hinzufügen, um Benutzer nach erfolgreicher Aktualisierung zurück zu Ihrer App zu leiten, `show_success=true`, um die Erfolgsseite sichtbar zu halten, `ui_locales=`, um die Standardsprache zu überschreiben, oder `identifier=`, um das Eingabefeld für den Bezeichner vorab auszufüllen.',
      single_task_flows_description:
        'Leiten Sie Benutzer direkt in einen bestimmten Ablauf (z. B. E-Mail-Verknüpfung). Optional können Sie `redirect=` hinzufügen, um Benutzer nach erfolgreicher Aktualisierung zurück zu Ihrer App zu leiten, `show_success=true`, um die Erfolgsseite sichtbar zu halten, `ui_locales=`, um die Standardsprache zu überschreiben, oder `identifier=`, um das Eingabefeld für den Bezeichner vorab auszufüllen.',
      tooltips: {
        email: 'Aktualisieren Sie Ihre primäre E-Mail-Adresse',
        phone: 'Aktualisieren Sie Ihre primäre Telefonnummer',
        username: 'Aktualisieren Sie Ihren Benutzernamen',
        password: 'Setzen Sie ein neues Passwort',
        social: 'Verknüpfen Sie ein Social-Konto für die Anmeldung',
        social_remove: 'Entfernen Sie ein verknüpftes Social-Konto',
        authenticator_app:
          'Richten Sie eine neue Authentifizierungs-App für die Multi-Faktor-Authentifizierung ein',
        authenticator_app_replace: 'Replace your existing authenticator app with a new one',
        passkey_add: 'Registrieren Sie einen neuen Sicherheitsschlüssel',
        passkey_manage:
          'Verwalten Sie Ihre vorhandenen Sicherheitsschlüssel oder fügen Sie neue hinzu',
        backup_codes_generate: 'Erstellen Sie ein neues Set von 10 Backup-Codes',
        backup_codes_manage:
          'Sehen Sie sich Ihre verfügbaren Backup-Codes an oder erstellen Sie neue',
        account_center:
          'Greifen Sie auf das Kontocenter zu, um Sicherheitseinstellungen wie E-Mail, Telefon, Benutzername, Passwort, MFA und verbundene Konten zu verwalten',
        profile:
          'Die zentrale Anlaufstelle zur Verwaltung Ihrer persönlichen Informationen (z. B. Name, Avatar)',
      },
      customize_note:
        'Möchten Sie nicht das vorgefertigte Erlebnis? Sie können mit der Account-API stattdessen vollständig',
      customize_link: 'Ihre Flows anpassen.',
    },
    custom_css: {
      title: 'CSS anpassen',
      description:
        'Passen Sie das Erscheinungsbild des Kontocenters mit benutzerdefiniertem CSS an.',
    },
  },
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Es wurde noch kein SMS-Konnektor eingerichtet. Bevor die Konfiguration abgeschlossen werden kann, können sich Benutzer nicht mit dieser Methode anmelden. <a>{{link}}</a> in "Verbindungen".',
    no_connector_email:
      'Es wurde noch kein E-Mail-Konnektor eingerichtet. Bevor die Konfiguration abgeschlossen werden kann, können sich Benutzer nicht mit dieser Methode anmelden. <a>{{link}}</a> in "Verbindungen".',
    no_connector_social:
      'Sie haben noch keine soziale Verbindung eingerichtet. Fügen Sie zuerst Verbindungen hinzu, um soziale Anmeldeverfahren anzuwenden. <a>{{link}}</a> in "Verbindungen".',
    no_connector_email_account_center:
      'Noch kein E-Mail-Konnektor eingerichtet. Richten Sie ihn unter <a>"E-Mail- und SMS-Konnektoren"</a> ein.',
    no_connector_sms_account_center:
      'Noch kein SMS-Konnektor eingerichtet. Richten Sie ihn unter <a>"E-Mail- und SMS-Konnektoren"</a> ein.',
    no_connector_social_account_center:
      'Noch kein Social-Konnektor eingerichtet. Richten Sie ihn unter <a>"Social-Konnektoren"</a> ein.',
    no_mfa_factor:
      'Es wurde noch kein MFA-Faktor eingerichtet. Richten Sie ihn in <a>{{link}}</a> ein.',
    setup_link: 'Einrichtung',
  },
  save_alert: {
    description:
      'Du implementierst neue Anmelde- und Registrierungsverfahren. Alle deine Benutzer können von der neuen Einrichtung betroffen sein. Bist du sicher, dass du die Änderung abschließen möchtest?',
    before: 'Vorher',
    after: 'Nachher',
    sign_up: 'Registrierung',
    sign_in: 'Anmeldung',
    social: 'Sozial',
    forgot_password_migration_notice:
      'Wir haben die Passwort-zurücksetzen-Verifizierung aktualisiert, um benutzerdefinierte Methoden zu unterstützen. Zuvor wurde dies automatisch durch Ihre E-Mail- und SMS-Konnektoren bestimmt. Klicken Sie auf <strong>Bestätigen</strong>, um das Upgrade abzuschließen.',
  },
  preview: {
    title: 'Vorschau',
    live_preview: 'Live-Vorschau',
    live_preview_tip: 'Speichern, um Änderungen anzuzeigen',
    native: 'Native',
    desktop_web: 'Desktop-Web',
    mobile_web: 'Mobile-Web',
    desktop: 'Desktop',
    mobile: 'Mobilgerät',
  },
  custom_profile_fields,
};

export default Object.freeze(sign_in_exp);
