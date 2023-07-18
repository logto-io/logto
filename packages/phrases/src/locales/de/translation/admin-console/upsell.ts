const upsell = {
  pro_tag: 'PRO',
  upgrade_plan: 'Upgrade-Plan',
  compare_plans: 'Pläne vergleichen',
  contact_us: 'Kontaktieren Sie uns',
  get_started: {
    title: 'Starten Sie Ihre nahtlose Identitätsreise mit einem <planName/>!',
    description:
      'Mit <planName/> können Sie Logto auf Ihren Nebenprojekten oder bei Tests ausprobieren. Um die volle Leistungsfähigkeit von Logto für Ihr Team zu nutzen, upgraden Sie, um unbegrenzten Zugriff auf Premium-Funktionen zu erhalten: unbegrenzte MAU-Nutzung, Maschine-zu-Maschine-Integration, nahtlose RBAC-Verwaltung, Langzeit-Audit-Logs und vieles mehr.',
    view_plans: 'Pläne anzeigen',
  },
  create_tenant: {
    title: 'Wählen Sie Ihren Tenant-Plan aus',
    description:
      'Logto bietet wettbewerbsfähige Planoptionen mit innovativer und erschwinglicher Preisgestaltung, die für wachsende Unternehmen entwickelt wurden. <a>Erfahren Sie mehr</a>',
    base_price: 'Grundpreis',
    monthly_price: '{{value, number}}/Monat',
    mau_unit_price: 'MAU-Einheitspreis',
    view_all_features: 'Alle Funktionen anzeigen',
    select_plan: '<name/> auswählen',
    upgrade_to: 'Auf <name/> upgraden',
    free_tenants_limit: 'Bis zu {{count, number}} kostenlose Tenant',
    free_tenants_limit_other: 'Bis zu {{count, number}} kostenlose Tenants',
    most_popular: 'Am beliebtesten',
    upgrade_success: 'Erfolgreich auf <name/> upgegradet',
  },
  paywall: {
    applications:
      'Sie haben das Limit von {{count, number}} <planName/>-Anwendungen erreicht. Um den Anforderungen Ihres Teams gerecht zu werden, upgraden Sie auf einen kostenpflichtigen Plan. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>.',
    applications_other:
      'Sie haben das Limit von {{count, number}} <planName/>-Anwendungen erreicht. Um den Anforderungen Ihres Teams gerecht zu werden, upgraden Sie auf einen kostenpflichtigen Plan. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>.',
    machine_to_machine_feature:
      'Upgraden Sie auf einen kostenpflichtigen Plan, um eine Maschine-zu-Maschine-Anwendung zu erstellen und Zugriff auf alle Premium-Funktionen zu erhalten. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>.',
    machine_to_machine:
      'Sie haben das Limit von {{count, number}} <planName/>-Maschine-zu-Maschine-Anwendungen erreicht. Um den Anforderungen Ihres Teams gerecht zu werden, upgraden Sie auf einen kostenpflichtigen Plan. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>.',
    machine_to_machine_other:
      'Sie haben das Limit von {{count, number}} <planName/>-Maschine-zu-Maschine-Anwendungen erreicht. Um den Anforderungen Ihres Teams gerecht zu werden, upgraden Sie auf einen kostenpflichtigen Plan. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>.',
    resources:
      'Sie haben das Limit von {{count, number}} <planName/>-API-Ressourcen erreicht. Upgraden Sie Ihren Plan, um den Anforderungen Ihres Teams gerecht zu werden. <a>Kontaktieren Sie uns</a> bei Bedarf.',
    resources_other:
      'Sie haben das Limit von {{count, number}} <planName/>-API-Ressourcen erreicht. Upgraden Sie Ihren Plan, um den Anforderungen Ihres Teams gerecht zu werden. <a>Kontaktieren Sie uns</a> bei Bedarf.',
    scopes_per_resource:
      'Sie haben das Limit von {{count, number}} Berechtigungen pro API-Ressource von <planName/> erreicht. Upgraden Sie jetzt, um zu erweitern. <a>Kontaktieren Sie uns</a> bei Bedarf.',
    scopes_per_resource_other:
      'Sie haben das Limit von {{count, number}} Berechtigungen pro API-Ressource von <planName/> erreicht. Upgraden Sie jetzt, um zu erweitern. <a>Kontaktieren Sie uns</a> bei Bedarf.',
    custom_domain:
      'Schalten Sie die Funktion für individuelle Domains frei und profitieren Sie von einer Reihe von Premium-Vorteilen, indem Sie auf einen kostenpflichtigen Plan upgraden. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    social_connectors:
      'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    social_connectors_other:
      'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    standard_connectors_feature:
      'Upgraden Sie auf einen kostenpflichtigen Plan, um eigene Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erstellen, sowie unbegrenzte Sozialconnectoren und alle Premium-Funktionen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    standard_connectors:
      'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    standard_connectors_other:
      'Sie haben das Limit von {{count, number}} <planName/>-Sozialconnectoren erreicht. Upgraden Sie Ihren Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    standard_connectors_pro:
      'Sie haben das Limit von {{count, number}} <planName/>-Standardconnectoren erreicht. Upgraden Sie auf den Enterprise-Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    standard_connectors_pro_other:
      'Sie haben das Limit von {{count, number}} <planName/>-Standardconnectoren erreicht. Upgraden Sie auf den Enterprise-Plan, um zusätzliche Sozialconnectoren und die Möglichkeit zur Erstellung eigener Connectoren mit OIDC, OAuth 2.0 und SAML-Protokollen zu erhalten. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    roles:
      'Sie haben das Limit von {{count, number}} <planName/>-Rollen erreicht. Upgraden Sie Ihren Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    roles_other:
      'Sie haben das Limit von {{count, number}} <planName/>-Rollen erreicht. Upgraden Sie Ihren Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    scopes_per_role:
      'Sie haben das Limit von {{count, number}} Berechtigungen pro Rolle von <planName/> erreicht. Upgraden Sie Ihren Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>.',
    scopes_per_role_other:
      'Sie haben das Limit von {{count, number}} Berechtigungen pro Rolle von <planName/> erreicht. Upgraden Sie Ihren Plan, um zusätzliche Rollen und Berechtigungen hinzuzufügen. Bei Fragen stehen wir Ihnen gerne zur Verfügung. <a>Kontaktieren Sie uns</a>.',
    hooks:
      'Sie haben das Limit von {{count, number}} <planName/>-Webhooks erreicht. Upgraden Sie Ihren Plan, um mehr Webhooks zu erstellen. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
    hooks_other:
      'Sie haben das Limit von {{count, number}} <planName/>-Webhooks erreicht. Upgraden Sie Ihren Plan, um mehr Webhooks zu erstellen. Zögern Sie nicht, <a>Kontaktieren Sie uns</a>, wenn Sie Hilfe benötigen.',
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
      'Hoppla! Die Zahlung für die Rechnung des Tenants {{name}} ist im letzten Abrechnungszeitraum fehlgeschlagen. Bitte zahlen Sie die Rechnung umgehend, um die Aussetzung des Logto-Dienstes zu vermeiden.',
    unpaid_bills_last_cycle: 'Unbezahlte Rechnungen im letzten Abrechnungszeitraum',
    update_payment: 'Zahlung aktualisieren',
  },
};

export default upsell;
