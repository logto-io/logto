const cloud = {
  self_hosted_licenses: {
    title: 'Self-hosted-Lizenzen',
    description:
      'Sieh dir die Lizenzen deines Kontos an und kopiere Schlüssel für deine selbst gehosteten Bereitstellungen.',
    empty_title: 'Noch keine Self-hosted-Lizenzen',
    empty_description:
      'Wenn du eine Lizenz gekauft hast, melde dich mit dem Konto an, das du für den Kauf verwendet hast.',
    load_error: 'Lizenzen konnten nicht geladen werden. Bitte versuche es erneut.',
    period_end: 'Aktueller Zeitraum endet',
    keys_title: 'Lizenzschlüssel',
    keys_description:
      'Halte diese Schlüssel geheim. Verwende den Schlüssel für deine Bereitstellungsumgebung.',
    production_key: 'Produktionsschlüssel',
    non_production_key: 'Nichtproduktionsschlüssel',
    keys_unavailable:
      'Für diese Lizenz sind keine Schlüssel verfügbar. Wende dich bei Bedarf an den Support.',
    keys_pending: 'Die Schlüssel sind verfügbar, sobald die Lizenz aktiv ist.',
    keys_payment_required:
      'Die Schlüssel sind nicht verfügbar, bis die offene Rechnung bezahlt ist. Bezahle sie über „Zahlung verwalten“, dann sind die Schlüssel wieder verfügbar.',
    manage_payment: 'Zahlung verwalten',
    issue_keys: 'Lizenzschlüssel abrufen',
    issue_error: 'Lizenzschlüssel konnten nicht ausgestellt werden. Bitte versuche es erneut.',
    install_title: 'Lizenz installieren',
    install_description:
      'Beide Schlüssel bieten dieselben Funktionen und Kontingente. Sofern dein Bestellformular nichts anderes vorsieht, deckt dein Abonnement eine Produktionsbereitstellung ab.',
    install_copy:
      'Kopiere den Produktionsschlüssel für den Produktivbetrieb oder den Nichtproduktionsschlüssel für Entwicklung und Tests.',
    install_paste:
      'Öffne in deiner selbst gehosteten Konsole Einstellungen → Lizenz, füge den Schlüssel ein und installiere ihn.',
    usage_warning_description: 'Diese Lizenz liegt über den Nutzungslimits ihres Plans:',
    usage_warning_metric: '{{metric}} ({{env}}): {{value}} (Limit {{limit}})',
    deployments_title: 'Bereitstellungen',
    deployments_description:
      'Bereitstellungen, die diese Lizenz aktualisiert haben, mit der zuletzt gemeldeten Nutzung. Monatswerte sind der höhere Wert aus dem letzten Monat und dem laufenden Monat. Inaktive Bereitstellungen haben sich in den letzten 15 Tagen nicht aktualisiert und zählen nicht zu den Limits.',
    deployments_empty: 'Noch keine Bereitstellung hat diese Lizenz aktualisiert.',
    deployment_id: 'Bereitstellungs-ID',
    logto_version: 'Logto-Version',
    last_seen: 'Zuletzt gesehen',
    inactive: 'Inaktiv',
    status: {
      pending: 'Wird aktiviert',
      active: 'Aktiv',
      past_due: 'Überfällig',
      canceling: 'Kündigung zum Periodenende',
      canceled: 'Gekündigt',
      unpaid: 'Unbezahlt',
      expired: 'Abgelaufen',
      revoked: 'Widerrufen',
    },
    purchase: {
      description:
        'Schalte kostenpflichtige Funktionen auf deiner eigenen Logto-Instanz mit einem Jahresabonnement frei.',
      price_per_month: '{{price}}/Monat',
      billed_annually: 'Jährliche Abrechnung',
      price_unavailable: 'Preis nicht verfügbar',
      feature_branding: 'Logto-Branding ausblenden',
      feature_custom_ui: 'Eigene Anmelde-UI verwenden',
      feature_collaboration: 'Zusammenarbeit in der Konsole',
      feature_saml: 'Unbegrenzte SAML-Anwendungen',
      feature_deployment: 'Eine Produktionsbereitstellung',
      subscribe: 'Abonnieren',
      enterprise: 'Brauchst du Enterprise? <a>Kontaktiere uns</a>',
      activating: 'Zahlung erhalten. Deine Lizenz wird aktiviert...',
      processing:
        'Deine Zahlung wird noch verarbeitet. Die Lizenz erscheint hier, sobald sie aktiv ist.',
      checkout_expired: 'Die Checkout-Sitzung ist abgelaufen. Bitte abonniere erneut.',
    },
    cancel: {
      action: 'Abonnement kündigen',
      keep: 'Abonnement behalten',
      confirm_title: 'Abonnement kündigen?',
      confirm_content:
        'Die Lizenz bleibt bis zum Ende des aktuellen Zeitraums aktiv und wird nicht verlängert. Danach können ihre Schlüssel nicht mehr aktualisiert werden.',
      success: 'Das Abonnement wird zum Ende des aktuellen Zeitraums gekündigt.',
      payment_required:
        'Bezahle vor der Kündigung die offene Rechnung. Nutze dafür „Zahlung verwalten“.',
      failed: 'Das Abonnement konnte nicht gekündigt werden. Bitte versuche es erneut.',
    },
  },
  console_sso: {
    back_to_list: 'Zurück zu Console SSO',
    create: 'Konnektor hinzufügen',
    title: 'Konsolen-SSO',
    description:
      'Konfiguriere deinen eigenen Identitätsanbieter, um dich per Single Sign-on bei der Logto Console anzumelden.',
    domain_bound: 'Gebunden',
    domain_pending: 'Wird überprüft',
    domain_verify_step: 'Domain verifizieren',
    domain_bind_step: 'E-Mail-Domain verknüpfen',
    domain_add_placeholder: 'E-Mail-Domain hinzufügen',
    domain_bound_description:
      'Diese Domain ist für Console SSO aktiv. Ihre TXT-Challenge wurde entfernt.',
    domain_dns_instructions:
      'Füge diesen TXT-Eintrag bei deinem DNS-Anbieter hinzu, um die Domaininhaberschaft zu bestätigen.',
    domain_waiting_for_dns: 'Wir warten auf den TXT-Eintrag und prüfen alle 10 Sekunden erneut.',
    domain_proven_unbound:
      'Die Domaininhaberschaft ist bestätigt, aber die Bindung ist unvollständig.',
    domain_verified: 'Domaininhaberschaft bestätigt.',
    domain_binding_pending: 'Die Verknüpfung beginnt nach der Verifizierung automatisch.',
    domain_remove_description:
      '{{domain}} aus Console SSO entfernen? Nach dem Entfernen einer gebundenen Domain funktioniert die SSO-Erkennung für deren E-Mail-Adressen nicht mehr.',
    domain_invalid: 'Gib eine gültige E-Mail-Domain ein.',
    domain_conflict: 'Diese Domain ist bereits an einen anderen Console-SSO-Connector gebunden.',
    domain_invalid_provider:
      'Schließe die Verbindungseinstellungen ab, bevor du diese Domain bindest.',
    domain_dns_timeout: 'Die DNS-Prüfung ist fehlgeschlagen. Wir versuchen es automatisch erneut.',
    domain_recovery: 'Die Domainänderung ist unvollständig.',
    start_over: 'Neu beginnen',
    start_over_confirmation:
      'Wenn Sie von vorne beginnen, wird Ihre unvollständige SSO-Konfiguration möglicherweise gelöscht. Möchten Sie fortfahren?',
    resume_creation:
      'Eine unvollständige Erstellung wurde gefunden. Fahre mit demselben Anbieter fort, um diesen Konnektor wiederherzustellen.',
    creation_charge_notice:
      'Standardpreis: <span>${{price, number}} pro Monat und Konsolen-SSO-Connector</span>. Wenn Sie Hilfe benötigen, können Sie uns gerne <a>kontaktieren</a>.',
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
