const quota_item = {
  tenant_limit: {
    name: 'Locataires',
    limited: '{{count, number}} locataire',
    limited_other: '{{count, number}} locataires',
    unlimited: 'Illimité locataires',
    not_eligible: 'Supprimez vos locataires',
  },
  mau_limit: {
    name: 'Utilisateurs actifs mensuels',
    limited: '{{count, number}} MAU',
    unlimited: 'Illimité MAU',
    not_eligible: 'Supprimez tous vos utilisateurs',
  },
  token_limit: {
    name: 'Tokens',
    limited: '{{count, number}} token',
    limited_other: '{{count, number}} tokens',
    unlimited: 'Unlimited tokens',
    not_eligible: 'Remove your all users to prevent new tokens',
  },
  applications_limit: {
    name: 'Applications',
    limited: '{{count, number}} application',
    limited_other: '{{count, number}} applications',
    unlimited: 'Illimité applications',
    not_eligible: 'Supprimez vos applications',
  },
  machine_to_machine_limit: {
    name: 'Machine to machine',
    limited: '{{count, number}} application machine à machine',
    limited_other: '{{count, number}} applications machine à machine',
    unlimited: 'Illimité applications machine à machine',
    not_eligible: 'Supprimez vos applications machine à machine',
  },
  third_party_applications_limit: {
    /** UNTRANSLATED */
    name: 'Third-party apps',
    /** UNTRANSLATED */
    limited: '{{count, number}} third-party app',
    /** UNTRANSLATED */
    limited_other: '{{count, number}} third-party apps',
    /** UNTRANSLATED */
    unlimited: 'Unlimited third-party apps',
    /** UNTRANSLATED */
    not_eligible: 'Remove your third-party apps',
  },
  resources_limit: {
    name: 'Ressources API',
    limited: '{{count, number}} ressource API',
    limited_other: '{{count, number}} ressources API',
    unlimited: 'Illimité ressources API',
    not_eligible: 'Supprimez vos ressources API',
  },
  scopes_per_resource_limit: {
    name: 'Permissions de ressource',
    limited: '{{count, number}} autorisation par ressource',
    limited_other: '{{count, number}} autorisations par ressource',
    unlimited: 'Illimité autorisation par ressource',
    not_eligible: 'Supprimez vos permissions de ressource',
  },
  custom_domain_enabled: {
    name: 'Domaine personnalisé',
    limited: 'Domaine personnalisé',
    unlimited: 'Domaine personnalisé',
    not_eligible: 'Supprimez votre domaine personnalisé',
  },
  omni_sign_in_enabled: {
    name: 'Connexion omni',
    limited: 'Connexion omni',
    unlimited: 'Connexion omni',
    not_eligible: 'Désactivez votre connexion omni',
  },
  built_in_email_connector_enabled: {
    name: 'Connecteur de messagerie intégré',
    limited: 'Connecteur de messagerie intégré',
    unlimited: 'Connecteur de messagerie intégré',
    not_eligible: 'Supprimez votre connecteur de messagerie intégré',
  },
  social_connectors_limit: {
    name: 'Connecteurs sociaux',
    limited: '{{count, number}} connecteur social',
    limited_other: '{{count, number}} connecteurs sociaux',
    unlimited: 'Illimité connecteurs sociaux',
    not_eligible: 'Supprimez vos connecteurs sociaux',
  },
  standard_connectors_limit: {
    name: 'Connecteurs standards gratuits',
    limited: '{{count, number}} connecteur standard gratuit',
    limited_other: '{{count, number}} connecteurs standards gratuits',
    unlimited: 'Illimité connecteurs standards',
    not_eligible: 'Supprimez vos connecteurs standards',
  },
  roles_limit: {
    name: 'Rôles',
    limited: '{{count, number}} rôle',
    limited_other: '{{count, number}} rôles',
    unlimited: 'Illimité rôles',
    not_eligible: 'Supprimez vos rôles',
  },
  machine_to_machine_roles_limit: {
    name: 'Machine to machine roles',
    limited: '{{count, number}} machine to machine role',
    limited_other: '{{count, number}} machine to machine roles',
    unlimited: 'Unlimited machine to machine roles',
    not_eligible: 'Remove your machine to machine roles',
  },
  scopes_per_role_limit: {
    name: 'Permissions de rôle',
    limited: '{{count, number}} permission par rôle',
    limited_other: '{{count, number}} permissions par rôle',
    unlimited: 'Illimité permission par rôle',
    not_eligible: 'Supprimez vos permissions de rôle',
  },
  hooks_limit: {
    name: 'Webhooks',
    limited: '{{count, number}} webhook',
    limited_other: '{{count, number}} webhooks',
    unlimited: 'Webhooks illimités',
    not_eligible: 'Supprimez vos webhooks',
  },
  organizations_enabled: {
    name: 'Organizations',
    limited: 'Organizations',
    unlimited: 'Organizations',
    not_eligible: 'Remove your organizations',
  },
  audit_logs_retention_days: {
    name: "Conservation des journaux d'audit",
    limited: "Conservation des journaux d'audit: {{count, number}} jour",
    limited_other: "Conservation des journaux d'audit: {{count, number}} jours",
    unlimited: 'Jours illimités',
    not_eligible: "Pas de journalisation d'audit",
  },
  email_ticket_support: {
    name: 'Assistance par ticket de messagerie électronique',
    limited: "{{count, number}} heure d'assistance par ticket de messagerie électronique",
    limited_other: "{{count, number}} heures d'assistance par ticket de messagerie électronique",
    unlimited: 'Assistance par ticket de messagerie électronique',
    not_eligible: 'Aucune assistance par ticket de messagerie électronique',
  },
  mfa_enabled: {
    name: 'Authentification à deux facteurs',
    limited: 'Authentification à deux facteurs',
    unlimited: 'Authentification à deux facteurs',
    not_eligible: 'Supprimez votre authentification à deux facteurs',
  },
  sso_enabled: {
    name: 'SSO Entreprise',
    limited: 'SSO Entreprise',
    unlimited: 'SSO Entreprise',
    not_eligible: 'Supprimez votre SSO Entreprise',
  },
  tenant_members_limit: {
    /** UNTRANSLATED */
    name: 'Tenant members',
    /** UNTRANSLATED */
    limited: '{{count, number}} tenant member',
    /** UNTRANSLATED */
    limited_other: '{{count, number}} tenant members',
    /** UNTRANSLATED */
    unlimited: 'Unlimited tenant members',
    /** UNTRANSLATED */
    not_eligible: 'Remove your tenant members',
  },
};

export default Object.freeze(quota_item);
