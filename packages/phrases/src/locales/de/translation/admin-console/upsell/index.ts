import add_on from './add-on.js';
import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'Upgrade-Plan',
  compare_plans: 'Pläne vergleichen',
  view_plans: 'Pläne anzeigen',
  create_tenant: {
    title: 'Wählen Sie Ihren Tenant-Plan aus',
    description:
      'Logto bietet wettbewerbsfähige Planoptionen mit innovativer und erschwinglicher Preisgestaltung, die für wachsende Unternehmen entwickelt wurden. <a>Erfahren Sie mehr</a>',
    base_price: 'Grundpreis',
    monthly_price: '{{value, number}}/Monat',
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
  token_exceeded_modal: {
    title: 'Token-Nutzung hat das Limit überschritten. Upgrade deinen Plan.',
    notification:
      'Du hast dein <planName/>-Token-Nutzungslimit überschritten. Benutzer werden nicht in der Lage sein, den Logto-Dienst ordnungsgemäß zu nutzen. Bitte upgrade deinen Plan umgehend auf Premium, um Unannehmlichkeiten zu vermeiden.',
  },
  payment_overdue_modal: {
    title: 'Zahlungsrückstand für Rechnung',
    notification:
      'Hoppla! Die Zahlung für die Rechnung des Mieters <span>{{name}}</span> ist fehlgeschlagen. Bitte zahlen Sie die Rechnung umgehend, um eine Sperrung des Logto-Dienstes zu vermeiden.',
    unpaid_bills: 'Ausstehende Rechnungen',
    update_payment: 'Zahlung aktualisieren',
  },
  add_on_quota_item: {
    api_resource: 'API-Ressource',
    machine_to_machine: 'Machine-to-Machine-Anwendung',
    tokens: '{{limit}}M Token',
    tenant_member: 'Mietermitglied',
  },
  charge_notification_for_quota_limit:
    'Sie haben Ihr {{item}}-Quotenlimit überschritten. Logto wird Gebühren für die Nutzung über Ihr Quotenlimit hinaus hinzufügen. Die Abrechnung beginnt am Tag der Veröffentlichung des neuen Add-On-Preisdesigns. <a>Mehr erfahren</a>',
  paywall,
  featured_plan_content,
  add_on,
  convert_to_production_modal: {
    title: 'Sie werden Ihren Entwicklungstenant in einen Produktionstenant umwandeln',
    description:
      'Bereit für den Live-Betrieb? Die Umwandlung dieses Entw-Tenant in einen Produkt-Tenant schaltet die volle Funktionalität frei',
    benefits: {
      stable_environment: 'Für Endbenutzer: Eine stabile Umgebung für den realen Einsatz.',
      keep_pro_features:
        'Pro-Funktionen behalten: Sie werden den Pro-Plan abonnieren. <a>Pro-Funktionen ansehen.</a>',
      no_dev_restrictions:
        'Keine Entwicklerbeschränkungen: Entfernt Entitäts- und Ressourcensystemlimits sowie das Anmeldebanner.',
    },
    cards: {
      dev_description: 'Testzwecke',
      prod_description: 'Echte Produktion',
      convert_label: 'umwandeln',
    },
    button: 'In Produkt-Tenant umwandeln',
  },
};

export default Object.freeze(upsell);
