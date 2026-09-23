const cloud = {
  console_sso: {
    back_to_list: 'Zurück zu Console SSO',
    create: 'Konnektor hinzufügen',
    title: 'Konsolen-SSO',
    description:
      'Konfiguriere deinen eigenen Identitätsanbieter, um dich per Single Sign-on bei der Logto Console anzumelden.',
    domain_bound: 'Gebunden',
    domain_pending: 'Wird überprüft',
    domain_add_placeholder: 'E-Mail-Domain hinzufügen',
    domain_membership_notice:
      'Verifizierte Domains steuern die Erkennung für Logto Cloud Console SSO. Sie gewähren keine Mitgliedschaft in einem Mandanten.',
    domain_bound_description:
      'Diese Domain ist für Console SSO aktiv. Ihre TXT-Challenge wurde entfernt.',
    domain_dns_instructions:
      'Füge diesen TXT-Eintrag bei deinem DNS-Anbieter hinzu, um die Domaininhaberschaft zu bestätigen.',
    domain_waiting_for_dns: 'Wir warten auf den TXT-Eintrag und prüfen alle 10 Sekunden erneut.',
    domain_proven_unbound:
      'Die Domaininhaberschaft ist bestätigt, aber die Bindung ist unvollständig. Behebe das Problem und versuche es erneut.',
    domain_remove_description:
      '{{domain}} aus Console SSO entfernen? Nach dem Entfernen einer gebundenen Domain funktioniert die SSO-Erkennung für deren E-Mail-Adressen nicht mehr.',
    domain_invalid: 'Gib eine gültige E-Mail-Domain ein.',
    domain_conflict: 'Diese Domain ist bereits an einen anderen Console-SSO-Connector gebunden.',
    domain_invalid_provider:
      'Schließe die Verbindungseinstellungen ab, bevor du diese Domain bindest.',
    domain_dns_timeout: 'Die DNS-Prüfung ist fehlgeschlagen. Wir versuchen es automatisch erneut.',
    domain_recovery:
      'Die Domainänderung ist unvollständig. Wiederhole die Verifizierung, um sie abzuschließen.',
    start_over: 'Neu beginnen',
    start_over_confirmation:
      'Wenn Sie von vorne beginnen, wird Ihre unvollständige SSO-Konfiguration möglicherweise gelöscht. Möchten Sie fortfahren?',
    resume_creation:
      'Eine unvollständige Erstellung wurde gefunden. Fahre mit demselben Anbieter fort, um diesen Konnektor wiederherzustellen.',
  },
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
