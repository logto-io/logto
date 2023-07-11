const quota_item = {
  tenant_limit: {
    name: 'Mieter',
    limited: '{{count, number}} Mieter',
    limited_other: '{{count, number}} Mieter',
    unlimited: 'Unbegrenzte Mieter',
  },
  mau_limit: {
    name: 'Monatlich aktive Benutzer',
    limited: '{{count, number}} MAU',
    unlimited: 'Unbegrenzte MAU',
  },
  applications_limit: {
    name: 'Anwendungen',
    limited: '{{count, number}} Anwendung',
    limited_other: '{{count, number}} Anwendungen',
    unlimited: 'Unbegrenzte Anwendungen',
  },
  machine_to_machine_limit: {
    name: 'Maschine-zu-Maschine',
    limited: '{{count, number}} Maschine-zu-Maschine-App',
    limited_other: '{{count, number}} Maschine-zu-Maschine-Apps',
    unlimited: 'Unbegrenzte Maschine-zu-Maschine-Apps',
  },
  resources_limit: {
    name: 'API-Ressourcen',
    limited: '{{count, number}} API-Ressource',
    limited_other: '{{count, number}} API-Ressourcen',
    unlimited: 'Unbegrenzte API-Ressourcen',
  },
  scopes_per_resource_limit: {
    name: 'Ressourcenberechtigungen',
    limited: '{{count, number}} Berechtigung pro Ressource',
    limited_other: '{{count, number}} Berechtigungen pro Ressource',
    unlimited: 'Unbegrenzte Berechtigung pro Ressource',
  },
  custom_domain_enabled: {
    name: 'Benutzerdefinierte Domain',
    limited: 'Benutzerdefinierte Domain',
    unlimited: 'Benutzerdefinierte Domain',
  },
  omni_sign_in_enabled: {
    name: 'Omni-Anmeldung',
    limited: 'Omni-Anmeldung',
    unlimited: 'Omni-Anmeldung',
  },
  built_in_email_connector_enabled: {
    name: 'Integrierter E-Mail-Connector',
    limited: 'Integrierter E-Mail-Connector',
    unlimited: 'Integrierter E-Mail-Connector',
  },
  social_connectors_limit: {
    name: 'Soziale Connectoren',
    limited: '{{count, number}} sozialer Connector',
    limited_other: '{{count, number}} soziale Connectoren',
    unlimited: 'Unbegrenzte soziale Connectoren',
  },
  standard_connectors_limit: {
    name: 'Kostenlose Standard-Connectoren',
    limited: '{{count, number}} kostenloser Standard-Connector',
    limited_other: '{{count, number}} kostenlose Standard-Connectoren',
    unlimited: 'Unbegrenzte Standard-Connectoren',
  },
  roles_limit: {
    name: 'Rollen',
    limited: '{{count, number}} Rolle',
    limited_other: '{{count, number}} Rollen',
    unlimited: 'Unbegrenzte Rollen',
  },
  scopes_per_role_limit: {
    name: 'Berechtigungen pro Rolle',
    limited: '{{count, number}} Berechtigung pro Rolle',
    limited_other: '{{count, number}} Berechtigungen pro Rolle',
    unlimited: 'Unbegrenzte Berechtigung pro Rolle',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} Hook',
    limited_other: '{{count, number}} Hooks',
    unlimited: 'Unbegrenzte Hooks',
  },
  audit_logs_retention_days: {
    name: 'Aufbewahrung von Prüfprotokollen',
    limited: 'Aufbewahrung von Prüfprotokollen: {{count, number}} Tag',
    limited_other: 'Aufbewahrung von Prüfprotokollen: {{count, number}} Tage',
    unlimited: 'Unbegrenzte Tage',
  },
  community_support_enabled: {
    name: 'Community-Support',
    limited: 'Community-Support',
    unlimited: 'Community-Support',
  },
  customer_ticket_support: {
    name: 'Kundenticket-Support',
    limited: '{{count, number}} Stunde Kundenticket-Support',
    limited_other: '{{count, number}} Stunden Kundenticket-Support',
    unlimited: 'Kundenticket-Support',
  },
};

export default quota_item;
