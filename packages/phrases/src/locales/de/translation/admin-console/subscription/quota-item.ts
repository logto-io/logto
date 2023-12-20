const quota_item = {
  tenant_limit: {
    name: 'Mandanten',
    limited: '{{count, number}} Mandant',
    limited_other: '{{count, number}} Mandanten',
    unlimited: 'Unbegrenzte Mandanten',
    not_eligible: 'Entferne deine Mandanten',
  },
  mau_limit: {
    name: 'Monatlich aktive Benutzer',
    limited: '{{count, number}} MAU',
    unlimited: 'Unbegrenzte MAU',
    not_eligible: 'Entferne alle Benutzer',
  },
  token_limit: {
    /** UNTRANSLATED */
    name: 'Tokens',
    /** UNTRANSLATED */
    limited: '{{count, number}} token',
    /** UNTRANSLATED */
    limited_other: '{{count, number}} tokens',
    /** UNTRANSLATED */
    unlimited: 'Unlimited tokens',
    /** UNTRANSLATED */
    not_eligible: 'Remove your all users to prevent new tokens',
  },
  applications_limit: {
    name: 'Anwendungen',
    limited: '{{count, number}} Anwendung',
    limited_other: '{{count, number}} Anwendungen',
    unlimited: 'Unbegrenzte Anwendungen',
    not_eligible: 'Entferne deine Anwendungen',
  },
  machine_to_machine_limit: {
    name: 'Maschine-zu-Maschine',
    limited: '{{count, number}} Maschine-zu-Maschine-App',
    limited_other: '{{count, number}} Maschine-zu-Maschine-Apps',
    unlimited: 'Unbegrenzte Maschine-zu-Maschine-Apps',
    not_eligible: 'Entferne deine Maschine-zu-Maschine-Apps',
  },
  resources_limit: {
    name: 'API-Ressourcen',
    limited: '{{count, number}} API-Ressource',
    limited_other: '{{count, number}} API-Ressourcen',
    unlimited: 'Unbegrenzte API-Ressourcen',
    not_eligible: 'Entferne deine API-Ressourcen',
  },
  scopes_per_resource_limit: {
    name: 'Berechtigungen pro Ressource',
    limited: '{{count, number}} Berechtigung pro Ressource',
    limited_other: '{{count, number}} Berechtigungen pro Ressource',
    unlimited: 'Unbegrenzte Berechtigung pro Ressource',
    not_eligible: 'Entferne deine Ressourcenberechtigungen',
  },
  custom_domain_enabled: {
    name: 'Benutzerdefinierte Domain',
    limited: 'Benutzerdefinierte Domain',
    unlimited: 'Benutzerdefinierte Domain',
    not_eligible: 'Entferne deine benutzerdefinierte Domain',
  },
  omni_sign_in_enabled: {
    name: 'Omni-Anmeldung',
    limited: 'Omni-Anmeldung',
    unlimited: 'Omni-Anmeldung',
    not_eligible: 'Deaktiviere deine Omni-Anmeldung',
  },
  built_in_email_connector_enabled: {
    name: 'Integrierter E-Mail-Connector',
    limited: 'Integrierter E-Mail-Connector',
    unlimited: 'Integrierter E-Mail-Connector',
    not_eligible: 'Entferne deinen integrierten E-Mail-Connector',
  },
  social_connectors_limit: {
    name: 'Soziale Connectoren',
    limited: '{{count, number}} sozialer Connector',
    limited_other: '{{count, number}} soziale Connectoren',
    unlimited: 'Unbegrenzte soziale Connectoren',
    not_eligible: 'Entferne deine sozialen Connectoren',
  },
  standard_connectors_limit: {
    name: 'Kostenlose Standard-Connectoren',
    limited: '{{count, number}} kostenloser Standard-Connector',
    limited_other: '{{count, number}} kostenlose Standard-Connectoren',
    unlimited: 'Unbegrenzte Standard-Connectoren',
    not_eligible: 'Entferne deine Standard-Connectoren',
  },
  roles_limit: {
    name: 'Rollen',
    limited: '{{count, number}} Rolle',
    limited_other: '{{count, number}} Rollen',
    unlimited: 'Unbegrenzte Rollen',
    not_eligible: 'Entferne deine Rollen',
  },
  machine_to_machine_roles_limit: {
    /** UNTRANSLATED */
    name: 'Machine to machine roles',
    /** UNTRANSLATED */
    limited: '{{count, number}} machine to machine role',
    /** UNTRANSLATED */
    limited_other: '{{count, number}} machine to machine roles',
    /** UNTRANSLATED */
    unlimited: 'Unlimited machine to machine roles',
    /** UNTRANSLATED */
    not_eligible: 'Remove your machine to machine roles',
  },
  scopes_per_role_limit: {
    name: 'Berechtigungen pro Rolle',
    limited: '{{count, number}} Berechtigung pro Rolle',
    limited_other: '{{count, number}} Berechtigungen pro Rolle',
    unlimited: 'Unbegrenzte Berechtigung pro Rolle',
    not_eligible: 'Entferne deine Rollenberechtigungen',
  },
  hooks_limit: {
    name: 'Webhooks',
    limited: '{{count, number}} Webhook',
    limited_other: '{{count, number}} Webhooks',
    unlimited: 'Unbegrenzte Webhooks',
    not_eligible: 'Entferne deine Webhooks',
  },
  organizations_enabled: {
    /** UNTRANSLATED */
    name: 'Organizations',
    /** UNTRANSLATED */
    limited: 'Organizations',
    /** UNTRANSLATED */
    unlimited: 'Organizations',
    /** UNTRANSLATED */
    not_eligible: 'Remove your organizations',
  },
  audit_logs_retention_days: {
    name: 'Audit-Log-Retention',
    limited: 'Audit-Log-Retention: {{count, number}} Tag',
    limited_other: 'Audit-Log-Retention: {{count, number}} Tage',
    unlimited: 'Unbegrenzte Tage',
    not_eligible: 'Keine Audit-Logs',
  },
  community_support_enabled: {
    name: 'Community-Support',
    limited: 'Community-Support',
    unlimited: 'Community-Support',
    not_eligible: 'Kein Community-Support',
  },
  customer_ticket_support: {
    name: 'Kundenticketsupport',
    limited: '{{count, number}} Stunde Kundenticketsupport',
    limited_other: '{{count, number}} Stunden Kundenticketsupport',
    unlimited: 'Kundenticketsupport',
    not_eligible: 'Kein Kundenticketsupport',
  },
  mfa_enabled: {
    name: 'MFA',
    limited: 'MFA',
    unlimited: 'MFA',
    not_eligible: 'Deaktivieren Sie Ihre MFA',
  },
  sso_enabled: {
    name: 'Enterprise SSO',
    limited: 'Enterprise SSO',
    unlimited: 'Enterprise SSO',
    not_eligible: 'Deaktivieren Sie Ihr Enterprise SSO',
  },
};

export default Object.freeze(quota_item);
