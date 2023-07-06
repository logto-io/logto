const subscription = {
  free_plan: 'Kostenloser Plan',
  free_plan_description: 'Für Nebenprojekte und erste Logto-Tests. Keine Kreditkarte.',
  hobby_plan: 'Hobby Plan',
  hobby_plan_description: 'Für einzelne Entwickler oder Entwicklungsumgebungen.',
  pro_plan: 'Pro Plan',
  pro_plan_description: 'Für Unternehmen, die sorglos von Logto profitieren möchten.',
  enterprise: 'Unternehmen',
  current_plan: 'Aktueller Plan',
  current_plan_description:
    'Dies ist Ihr aktueller Plan. Sie können die Plan-Nutzung, Ihre nächste Rechnung anzeigen und bei Bedarf auf einen höheren Plan upgraden.',
  plan_usage: 'Plan-Nutzung',
  plan_cycle: 'Plan-Zyklus: {{period}}. Die Nutzung erneuert sich am {{renewDate}}.',
  next_bill: 'Ihre nächste Rechnung',
  next_bill_hint: 'Um mehr über die Berechnung zu erfahren, lesen Sie bitte diesen <a>Artikel</a>.',
  next_bill_tip:
    'Ihre kommende Rechnung enthält den Grundpreis Ihres Plans für den nächsten Monat sowie die Kosten Ihrer Nutzung multipliziert mit dem MAU-Einheitspreis in verschiedenen Stufen.',
  manage_payment: 'Zahlung verwalten',
  overfill_quota_warning:
    'Sie haben das Quotumlimit erreicht. Um Probleme zu vermeiden, upgraden Sie den Plan.',
  upgrade_pro: 'Pro Plan upgraden',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Es wurde ein Zahlungsproblem festgestellt. ${{price, number}} für den vorherigen Zyklus kann nicht verarbeitet werden. Aktualisieren Sie die Zahlung, um eine Logto-Dienstaussetzung zu vermeiden.',
  downgrade: 'Downgrade',
  current: 'Aktuell',
  buy_now: 'Jetzt kaufen',
  contact_us: 'Kontaktieren Sie uns',
  quota_table: {
    quota: {
      title: 'Quota',
      tenant_limit: 'Maximale Anzahl an Mandanten',
      base_price: 'Grundpreis',
      mau_unit_price: '* MAU-Einheitspreis',
      mau_limit: 'MAU-Grenzwert',
    },
    application: {
      title: 'Anwendungen',
      total: 'Gesamt',
      m2m: 'Machine-to-Machine',
    },
    resource: {
      title: 'API-Ressourcen',
      resource_count: 'Ressourcenanzahl',
      scopes_per_resource: 'Berechtigungen pro Ressource',
    },
    branding: {
      title: 'Branding',
      custom_domain: 'Benutzerdefinierte Domain',
    },
    user_authn: {
      title: 'Benutzerauthentifizierung',
      omni_sign_in: 'Omni-Anmeldung',
      built_in_email_connector: 'Integrierter E-Mail-Connector',
      social_connectors: 'Soziale Connectors',
      standard_connectors: 'Standard-Connectors',
    },
    roles: {
      title: 'Rollen',
      roles: 'Rollen',
      scopes_per_role: 'Berechtigungen pro Rolle',
    },
    audit_logs: {
      title: 'Audit-Logs',
      retention: 'Aufbewahrungsfrist',
    },
    hooks: {
      title: 'Hooks',
      amount: 'Menge',
    },
    support: {
      title: 'Support',
      community: 'Community',
      customer_ticket: 'Kundenticket',
      premium: 'Premium',
    },
    mau_unit_price_footnote:
      '* Unsere Einheitspreise können je nach tatsächlichem Ressourcenverbrauch variieren, und Logto behält sich das Recht vor, Änderungen der Einheitspreise zu erklären.',
    unlimited: 'Unbegrenzt',
    contact: 'Kontaktieren',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{value, number}}/Mon',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{value, number}}/MAU',
    days_one: '{{count, number}} Tag',
    days_other: '{{count, number}} Tage',
    add_on: 'Add-on',
  },
  downgrade_form: {
    allowed_title: 'Möchten Sie wirklich eine Herabstufung durchführen?',
    allowed_description:
      'Durch die Herabstufung auf den {{plan}} haben Sie keinen Zugriff mehr auf die folgenden Vorteile.',
    not_allowed_title: 'Sie sind nicht berechtigt zur Herabstufung',
    not_allowed_description:
      'Stellen Sie sicher, dass Sie die folgenden Standards erfüllen, bevor Sie auf den {{plan}} herabstufen. Sobald Sie die Anforderungen erfüllt haben, sind Sie zur Herabstufung berechtigt.',
    confirm_downgrade: 'Trotzdem herabstufen',
  },
};

export default subscription;
