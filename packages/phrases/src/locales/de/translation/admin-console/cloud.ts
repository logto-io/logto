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
    hear_about_us: {
      title: 'Wie haben Sie zum ersten Mal von Logto erfahren?',
      detail_placeholder: 'Erzählen Sie uns mehr (optional)',
      options: {
        search_engine: 'Suchmaschine (Google, Bing...)',
        ai_assistant: 'KI-Assistent (ChatGPT, Claude, Gemini...)',
        github_oss: 'GitHub oder Open-Source-Verzeichnisse',
        friend_colleague: 'Freund oder Kollege',
        powered_by: 'Anmeldeseite einer App, die Logto verwendet',
        content_social: 'Soziale Medien, Artikel oder Video (YouTube, X, Reddit...)',
        other: 'Sonstiges',
      },
    },
  },
  social_callback: {
    title: 'Sie haben sich erfolgreich angemeldet',
    description:
      'Sie haben sich erfolgreich mit Ihrem Social-Account angemeldet. Um eine nahtlose Integration und den Zugriff auf alle Funktionen von Logto zu gewährleisten, empfehlen wir Ihnen, Ihren eigenen Social-Connector zu konfigurieren.',
    notice:
      'Bitte vermeiden Sie die Verwendung des Demo-Connectors für Produktionszwecke. Sobald Sie die Tests abgeschlossen haben, löschen Sie bitte den Demo-Connector und richten Sie Ihren eigenen Connector mit Ihren Anmeldedaten ein.',
  },
  tenant: {
    create_tenant: 'Tenant erstellen',
  },
};

export default Object.freeze(cloud);
