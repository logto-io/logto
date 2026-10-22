const enterprise_subscription = {
  page_title: 'Abonnement',
  title: 'Verwalten Sie Ihr Abonnement',
  subtitle: 'Hier können Sie Ihr Multi-Tenant-Abonnement und den Zahlungsverlauf verwalten',
  tab: {
    subscription: 'Abonnement',
    billing_history: 'Zahlungsverlauf',
  },
  subscription: {
    title: 'Abonnement',
    description:
      'Verfolgen Sie ganz einfach Ihre Nutzung, sehen Sie Ihre nächste Rechnung und überprüfen Sie Ihren ursprünglichen Vertrag.',
    enterprise_plan_title: 'Unternehmensplan',
    enterprise_plan_description:
      'Dies ist Ihr Unternehmensplan-Abonnement und dieses Kontingent wird zwischen den Mandanten geteilt. Die Nutzung kann unter Umständen leicht verzögert aktualisiert werden. ',
    add_on_title: 'Add-ons nach Bedarf',
    add_on_description:
      'Dies sind zusätzliche Add-ons nach Bedarf basierend auf Ihrem Vertrag oder den standardmäßigen Pay-as-you-go-Sätzen von Logto. Ihnen werden Gebühren entsprechend Ihrer tatsächlichen Nutzung berechnet.',
    included: 'Inklusive',
    over_quota: 'Über dem Kontingent',
    basic_plan_column_title: {
      product: 'Produkt',
      usage: 'Nutzung',
      quota: 'Kontingent',
    },
    add_on_column_title: {
      product: 'Produkt',
      unit_price: 'Stückpreis',
      quantity: 'Menge',
      total_price: 'Gesamt',
    },
    add_on_sku_price: '${{price}}/Monat',
    private_region_title: 'Private Cloud-Instanz ({{regionName}})',
    shared_cross_tenants: 'Über Mandanten hinweg',
  },
  user_subscriptions: {
    description:
      'Persönliche Abonnements und vertragliche Enterprise-Kontingente unabhängig vom ausgewählten Mandanten anzeigen.',
    personal_title: 'Persönliche Abonnements',
    personal_description:
      'Ihrem Konto in Rechnung gestellte Abonnements, einschließlich früherer Abonnements.',
    enterprise_description:
      'Das Console-SSO-Kontingent wird vertraglich festgelegt und von berechtigten Administratoren gemeinsam genutzt. Persönliche Abonnements werden separat abgerechnet.',
    allowance: 'Vertragliches Kontingent',
    not_covered:
      'Dieser Enterprise-Plan enthält kein Console-SSO-Kontingent. Neue Connectors werden über ein persönliches Abonnement abgerechnet.',
    quantity_price: 'Menge × Einzelpreis',
    billing_period: 'Abrechnungszeitraum',
    connectors: 'Console-SSO-Konnektoren',
    no_connectors: 'Keine Konnektoren',
    list_price_note:
      'Die angezeigte Menge, der Einzelpreis und der Status stammen aus dem Abonnementdatensatz. Eine Pause des Zahlungseinzugs kann Menge und Status unverändert lassen. Einzelpreise enthalten keine Steuern, Rabatte oder anteiligen Anpassungen und stellen weder aktuelle Gebühren noch einen fälligen Betrag dar.',
    proration_note:
      'Console-SSO-Ergänzungen und -Entfernungen werden auf der regulären Rechnung anteilig abgerechnet. Das Löschen des letzten kostenpflichtigen Konnektors kündigt das Abonnement und löst die Schlussabrechnung aus.',
    overdue_note:
      'Nach drei aufeinanderfolgenden unbezahlten Abrechnungszeiträumen und ausgeschöpften Wiederholungsversuchen wird der Zahlungseinzug pausiert und kostenpflichtige Console-SSO-Konnektoren werden entfernt. Aktualisierte Zahlungsdaten stellen deren Konfiguration nicht wieder her. Kontaktieren Sie uns für Hilfe.',
    cancel_on: 'Kündigung geplant für {{date}}',
    other_product: 'Anderes Abonnement',
    status: {
      active: 'Aktiv',
      trialing: 'Testphase',
      past_due: 'Überfällig',
      unpaid: 'Unbezahlt',
      canceled: 'Gekündigt',
      incomplete: 'Unvollständig',
      incomplete_expired: 'Abgelaufen',
      paused: 'Pausiert',
    },
  },
};

export default Object.freeze(enterprise_subscription);
