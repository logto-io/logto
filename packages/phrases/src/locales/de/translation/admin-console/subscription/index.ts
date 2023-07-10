import quota_item_limited from './quota-item-limited.js';
import quota_item_unlimited from './quota-item-unlimited.js';
import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Kostenloser Plan',
  free_plan_description: 'Für Nebenprojekte und erste Logto-Tests. Keine Kreditkarte erforderlich.',
  hobby_plan: 'Hobby Plan',
  hobby_plan_description: 'Für einzelne Entwickler oder Entwicklungsumgebungen.',
  pro_plan: 'Pro Plan',
  pro_plan_description: 'Für Unternehmen, die sorgenfrei von Logto profitieren möchten.',
  enterprise: 'Unternehmen',
  current_plan: 'Aktueller Plan',
  current_plan_description:
    'Dies ist Ihr aktueller Plan. Sie können die Plan-Nutzung einsehen, Ihre nächste Rechnung überprüfen und auf einen höheren Tarif upgraden, wenn Sie möchten.',
  plan_usage: 'Plan-Nutzung',
  plan_cycle: 'Plan-Zyklus: {{period}}. Die Nutzung wird am {{renewDate}} erneuert.',
  next_bill: 'Ihre nächste Rechnung',
  next_bill_hint: 'Weitere Informationen zur Berechnung finden Sie in diesem <a>Artikel</a>.',
  next_bill_tip:
    'Ihre bevorstehende Rechnung enthält den Grundpreis Ihres Plans für den nächsten Monat sowie die Kosten für Ihre Nutzung multipliziert mit dem MAU-Einheitspreis in verschiedenen Stufen.',
  manage_payment: 'Zahlung verwalten',
  overfill_quota_warning:
    'Sie haben Ihr Quotenlimit erreicht. Um Probleme zu vermeiden, upgraden Sie den Plan.',
  upgrade_pro: 'Pro upgraden',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Es wurde ein Zahlungsproblem festgestellt. Der Betrag von ${{price, number}} für den vorherigen Zyklus kann nicht verarbeitet werden. Aktualisieren Sie die Zahlung, um eine Aussetzung des Logto-Dienstes zu vermeiden.',
  downgrade: 'Herabstufen',
  current: 'Aktuell',
  buy_now: 'Jetzt kaufen',
  contact_us: 'Kontaktieren Sie uns',
  quota_table,
  billing_history: {
    invoice_column: 'Rechnungen',
    status_column: 'Status',
    amount_column: 'Betrag',
    invoice_created_date_column: 'Rechnungsdatum',
  },
  quota_item_limited,
  quota_item,
  quota_item_unlimited,
  downgrade_modal: {
    title: 'Sind Sie sicher, dass Sie herabstufen möchten?',
    description:
      'Wenn Sie sich für den Wechsel zum <targetName/> entscheiden, beachten Sie bitte, dass Sie keinen Zugriff mehr auf die Quote und die Funktionen haben, die zuvor in <currentName/> enthalten waren.',
    before: 'Vorher: <name/>',
    after: 'Nachher: <name />',
    downgrade: 'Herabstufen',
    not_eligible: 'Sie sind nicht berechtigt für eine Herabstufung',
    not_eligible_description:
      'Stellen Sie sicher, dass Sie die folgenden Kriterien erfüllen, bevor Sie auf <name/> herabstufen.',
    a_maximum_of: 'Maximal <item/>',
  },
};

export default subscription;
