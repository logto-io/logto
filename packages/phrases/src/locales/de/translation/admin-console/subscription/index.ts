import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Kostenloser Plan',
  free_plan_description: 'Für Nebenprojekte und erste Logto-Tests. Keine Kreditkarte erforderlich.',
  pro_plan: 'Pro plan',
  pro_plan_description: 'Für Unternehmen, die sorgenfrei von Logto profitieren möchten.',
  enterprise: 'Unternehmen',
  current_plan: 'Aktueller Plan',
  current_plan_description:
    'Hier ist dein aktueller Tarif. Du kannst einfach deinen Tarifverbrauch einsehen, deine anstehende Rechnung überprüfen und bei Bedarf Änderungen an deinem Tarif vornehmen.',
  plan_usage: 'Plan-Nutzung',
  plan_cycle: 'Plan-Zyklus: {{period}}. Die Nutzung wird am {{renewDate}} erneuert.',
  next_bill: 'Ihre nächste Rechnung',
  next_bill_hint: 'Weitere Informationen zur Berechnung finden Sie in diesem <a>Artikel</a>.',
  next_bill_tip:
    'Die hier angezeigten Preise verstehen sich exklusive Steuern. Die Steuer wird auf Grundlage der von Ihnen bereitgestellten Informationen und Ihrer lokalen gesetzlichen Anforderungen berechnet und in Ihren Rechnungen ausgewiesen.',
  manage_payment: 'Zahlung verwalten',
  overfill_quota_warning:
    'Sie haben Ihr Quotenlimit erreicht. Um Probleme zu vermeiden, upgraden Sie den Plan.',
  upgrade_pro: 'Pro upgraden',
  update_payment: 'Zahlung aktualisieren',
  payment_error:
    'Es wurde ein Zahlungsproblem festgestellt. Der Betrag von ${{price, number}} für den vorherigen Zyklus kann nicht verarbeitet werden. Aktualisieren Sie die Zahlung, um eine Aussetzung des Logto-Dienstes zu vermeiden.',
  downgrade: 'Herabstufen',
  current: 'Aktuell',
  upgrade: 'Upgrade',
  quota_table,
  billing_history: {
    invoice_column: 'Rechnungen',
    status_column: 'Status',
    amount_column: 'Betrag',
    invoice_created_date_column: 'Rechnungsdatum',
    invoice_status: {
      void: 'Storniert',
      paid: 'Bezahlt',
      open: 'Offen',
      uncollectible: 'Überfällig',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'Sind Sie sicher, dass Sie herabstufen möchten?',
    description:
      'Wenn Sie sich für den Wechsel zum <targetName/> entscheiden, beachten Sie bitte, dass Sie keinen Zugriff mehr auf die Quote und die Funktionen haben, die zuvor in <currentName/> enthalten waren.',
    before: 'Vorher: <name/>',
    after: 'Nachher: <name />',
    downgrade: 'Herabstufen',
  },
  not_eligible_modal: {
    downgrade_title: 'Downgrade nicht möglich',
    downgrade_description:
      'Stellen Sie sicher, dass Sie die folgenden Kriterien erfüllen, bevor Sie auf <name/> downgraden.',
    downgrade_help_tip: 'Hilfe beim Downgrade benötigt? <a>Kontaktieren Sie uns</a>.',
    upgrade_title: 'Freundliche Erinnerung für unsere geschätzten Early Adopters',
    upgrade_description:
      'Sie nutzen derzeit mehr als das, was <name /> erlaubt. Logto ist nun offiziell und bietet Funktionen, die auf jeden Tarif zugeschnitten sind. Bevor Sie ein Upgrade auf den <name /> in Betracht ziehen, stellen Sie sicher, dass Sie die folgenden Kriterien für das Upgrade erfüllen.',
    upgrade_pro_tip: ' Oder erwägen Sie ein Upgrade auf den Pro plan.',
    upgrade_help_tip: 'Hilfe beim Upgrade benötigt? <a>Kontaktieren Sie uns</a>.',
    a_maximum_of: 'Maximal <item/>',
  },
  upgrade_success: 'Erfolgreich auf <name/> hochgestuft',
  downgrade_success: 'Erfolgreich auf <name/> herabgestuft',
  subscription_check_timeout: 'Abo-Überprüfung ist abgelaufen. Bitte später aktualisieren.',
  no_subscription: 'Kein Abonnement',
};

export default Object.freeze(subscription);
