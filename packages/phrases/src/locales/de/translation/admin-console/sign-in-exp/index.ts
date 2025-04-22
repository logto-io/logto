import content from './content.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Anmeldeoberfläche',
  title: 'Anmeldeoberfläche',
  description:
    'Passen Sie die Authentifizierungsabläufe und die Benutzeroberfläche an, und sehen Sie sich das Erlebnis sofort an.',
  tabs: {
    branding: 'Branding',
    sign_up_and_sign_in: 'Anmeldung und Registrierung',
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
  sign_up_and_sign_in,
  content,
  setup_warning: {
    no_connector_sms:
      'Es wurde noch kein SMS-Konnektor eingerichtet. Bevor die Konfiguration abgeschlossen werden kann, können sich Benutzer nicht mit dieser Methode anmelden. <a>{{link}}</a> in "Verbindungen".',
    no_connector_email:
      'Es wurde noch kein E-Mail-Konnektor eingerichtet. Bevor die Konfiguration abgeschlossen werden kann, können sich Benutzer nicht mit dieser Methode anmelden. <a>{{link}}</a> in "Verbindungen".',
    no_connector_social:
      'Sie haben noch keine soziale Verbindung eingerichtet. Fügen Sie zuerst Verbindungen hinzu, um soziale Anmeldeverfahren anzuwenden. <a>{{link}}</a> in "Verbindungen".',
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
};

export default Object.freeze(sign_in_exp);
