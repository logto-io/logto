import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'Upgrade plan',
  compare_plans: 'Pläne vergleichen',
  view_plans: 'Pläne anzeigen',
  create_tenant: {
    title: 'Wählen Sie Ihren Tenant-Plan aus',
    description:
      'Logto bietet wettbewerbsfähige Planoptionen mit innovativer und erschwinglicher Preisgestaltung, die für wachsende Unternehmen entwickelt wurden. <a>Erfahren Sie mehr</a>',
    base_price: 'Grundpreis',
    monthly_price: '{{value, number}}/Monat',
    mau_unit_price: 'MAU-Einheitspreis',
    view_all_features: 'Alle Funktionen anzeigen',
    select_plan: '<name/> auswählen',
    free_tenants_limit: 'Bis zu {{count, number}} kostenlose Tenant',
    free_tenants_limit_other: 'Bis zu {{count, number}} kostenlose Tenants',
    most_popular: 'Am beliebtesten',
    upgrade_success: 'Erfolgreich auf <name/> upgegradet',
  },
  mau_exceeded_modal: {
    title: 'MAU-Limit überschritten. Upgraden Sie Ihren Plan.',
    notification:
      'Ihr aktueller MAU hat das Limit von <planName/> überschritten. Bitte upgraden Sie umgehend auf den Premium-Plan, um die Aussetzung des Logto-Dienstes zu vermeiden.',
    update_plan: 'Plan aktualisieren',
  },
  payment_overdue_modal: {
    title: 'Zahlungsrückstand für Rechnung',
    notification:
      'Hoppla! Die Zahlung für die Rechnung des Mieters <span>{{name}}</span> ist fehlgeschlagen. Bitte zahlen Sie die Rechnung umgehend, um eine Sperrung des Logto-Dienstes zu vermeiden.',
    unpaid_bills: 'Ausstehende Rechnungen',
    update_payment: 'Zahlung aktualisieren',
  },
  /** UNTRANSLATED */
  charge_notification_for_quota_limit:
    'You have reached your quota limit. We may add charges for features that go beyond your quota limit as add-ons, once we finalize the prices.',
  /** UNTRANSLATED */
  charge_notification_for_token_limit:
    'You have reached your {{value}}M token quota limit. We may add charges for features that go beyond your quota limit as add-ons, once we finalize the prices.',
  paywall,
};

export default Object.freeze(upsell);
