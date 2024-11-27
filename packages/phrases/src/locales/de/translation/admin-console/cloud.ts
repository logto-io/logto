const cloud = {
  general: {
    onboarding: 'Einführung',
  },
  create_tenant: {
    page_title: 'Mandant erstellen',
    title: 'Erstellen Sie Ihren ersten Mandanten',
    description:
      'Ein Mandant ist eine isolierte Umgebung, in der Sie Benutzeridentitäten, Anwendungen und alle anderen Logto-Ressourcen verwalten können.',
    invite_collaborators: 'Laden Sie Ihre Mitarbeiter per E-Mail ein',
  },
  social_callback: {
    title: 'Sie haben sich erfolgreich angemeldet',
    description:
      'Sie haben sich erfolgreich mit Ihrem Social-Account angemeldet. Um eine nahtlose Integration und den Zugriff auf alle Funktionen von Logto zu gewährleisten, empfehlen wir Ihnen, Ihren eigenen Social-Connector zu konfigurieren.',
    /** UNTRANSLATED */
    notice:
      "Please avoid using the demo connector for production purposes. Once you've completed testing, kindly delete the demo connector and set up your own connector with your credentials.",
  },
  tenant: {
    create_tenant: 'Tenant erstellen',
  },
};

export default Object.freeze(cloud);
