import content from './content.js';
import password_policy from './password-policy.js';
import sign_up_and_sign_in from './sign-up-and-sign-in.js';

const sign_in_exp = {
  page_title: 'Anmeldeoberfläche',
  title: 'Anmeldeoberfläche',
  description:
    'Passe die Benutzeroberfläche für die Anmeldung an deine Marke an und zeige eine Vorschau in Echtzeit an',
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
    favicon: 'Favicon',
    logo_image_url: 'App Logo-URL',
    logo_image_url_placeholder: 'https://dein.cdn.domain/logo.png',
    dark_logo_image_url: 'App Logo-URL (Dunkler Modus)',
    dark_logo_image_url_placeholder: 'https://dein.cdn.domain/logo-dark.png',
    logo_image: 'App-Logo',
    dark_logo_image: 'App-Logo (Dunkler Modus)',
    logo_image_error: 'App-Logo: {{error}}',
    favicon_error: 'Favicon: {{error}}',
  },
  custom_css: {
    title: 'Benutzerdefiniertes CSS',
    css_code_editor_title: 'Personalisiere dein UI mit Benutzerdefiniertem CSS',
    css_code_editor_description1: 'Beispiele für benutzerdefiniertes CSS anzeigen.',
    css_code_editor_description2: '<a>{{link}}</a>.',
    css_code_editor_description_link_content: 'Erfahre mehr',
    css_code_editor_content_placeholder:
      'Gib dein benutzerdefiniertes CSS ein, um den Stil von allem genau nach deinen Vorgaben zu gestalten. Gib deiner Kreativität Ausdruck und hebe dein UI hervor.',
  },
  sign_up_and_sign_in,
  content,
  password_policy,
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
