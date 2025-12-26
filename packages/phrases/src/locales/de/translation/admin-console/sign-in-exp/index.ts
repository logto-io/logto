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
    css_code_editor_title: 'Benutzerdefiniertes CSS',
    css_code_editor_description1: 'Siehe das Beispiel für benutzerdefiniertes CSS.',
    css_code_editor_description2: '<a>{{link}}</a>',
    css_code_editor_description_link_content: 'Erfahre mehr',
    css_code_editor_content_placeholder:
      'Geben Sie Ihr benutzerdefiniertes CSS ein, um die Stile nach Ihren exakten Spezifikationen anzupassen. Drücken Sie Ihre Kreativität aus und heben Sie Ihre Benutzeroberfläche hervor.',
    bring_your_ui_title: 'Bringen Sie Ihr UI',
    bring_your_ui_description:
      'Laden Sie ein komprimiertes Paket (.zip) hoch, um die vorgefertigte Benutzeroberfläche von Logto durch Ihren eigenen Code zu ersetzen. <a>Erfahren Sie mehr</a>',
    preview_with_bring_your_ui_description:
      'Ihre benutzerdefinierten UI-Assets wurden erfolgreich hochgeladen und werden jetzt bereitgestellt. Daher wurde das eingebaute Vorschaufenster deaktiviert.\nUm Ihre personalisierte Anmelde-Benutzeroberfläche zu testen, klicken Sie auf die Schaltfläche "Live-Vorschau", um sie in einem neuen Browser-Tab zu öffnen.',
  },
  account_center: {
    title: 'KONTOZENTRUM',
    description: 'Passen Sie Ihre Kontozentrums-Workflows mit den Logto-APIs an.',
    enable_account_api: 'Account-API aktivieren',
    enable_account_api_description:
      'Aktivieren Sie die Account-API, um ein individuelles Kontozentrum aufzubauen und Endnutzer*innen direkten API-Zugriff ohne Logto Management API zu ermöglichen.',
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
          'Verwalten Sie den Zugriff auf die Account-API, damit Benutzer nach der Anmeldung Identitätsinformationen und Authentifizierungsfaktoren anzeigen oder bearbeiten können. Bevor sie sicherheitsrelevante Änderungen vornehmen, müssen sie ihre Identität verifizieren und eine 10 Minuten gültige Verifizierungs-ID erhalten.',
        groups: {
          identifiers: {
            title: 'Identifikatoren',
          },
          authentication_factors: {
            title: 'Authentifizierungsfaktoren',
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
    },
    webauthn_related_origins: 'WebAuthn-bezogene Ursprünge',
    webauthn_related_origins_description:
      'Fügen Sie die Domains Ihrer Frontend-Anwendungen hinzu, die über die Account-API Passkeys registrieren dürfen.',
    webauthn_related_origins_error: 'Der Ursprung muss mit https:// oder http:// beginnen',
    prebuilt_ui: {
      /** UNTRANSLATED */
      title: 'INTEGRATE PREBUILT UI',
      /** UNTRANSLATED */
      description:
        'Quickly integrate out-of-the-box verification and security setting flows with prebuilt UI.',
      /** UNTRANSLATED */
      flows_title: 'Integrate out-of-the-box security setting flows',
      /** UNTRANSLATED */
      flows_description:
        'Combine your domain with the route to form your account setting URL (e.g., https://auth.foo.com/account/email). Optionally add a `redirect=` URL parameter to return users to your app after successfully updating.',
      tooltips: {
        /** UNTRANSLATED */
        email: 'Update your primary email address',
        /** UNTRANSLATED */
        phone: 'Update your primary phone number',
        /** UNTRANSLATED */
        username: 'Update your username',
        /** UNTRANSLATED */
        password: 'Set a new password',
        /** UNTRANSLATED */
        authenticator_app: 'Set up a new authenticator app for multi-factor authentication',
        /** UNTRANSLATED */
        passkey_add: 'Register a new passkey',
        /** UNTRANSLATED */
        passkey_manage: 'Manage your existing passkeys or add new ones',
        /** UNTRANSLATED */
        backup_codes_generate: 'Generate a new set of 10 backup codes',
        /** UNTRANSLATED */
        backup_codes_manage: 'View your available backup codes or generate new ones',
      },
      /** UNTRANSLATED */
      customize_note: "Don't want the out-of-the-box experience? You can fully",
      /** UNTRANSLATED */
      customize_link: 'customize your flows with the Account API instead.',
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
