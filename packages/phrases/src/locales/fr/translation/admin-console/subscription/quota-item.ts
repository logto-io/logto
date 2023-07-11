const quota_item = {
  tenant_limit: {
    name: 'Locataires',
    limited: '{{count, number}} locataire',
    limited_other: '{{count, number}} locataires',
    unlimited: 'Locataires illimités',
  },
  mau_limit: {
    name: 'Utilisateurs actifs par mois',
    limited: '{{count, number}} MAU',
    unlimited: 'MAU illimité',
  },
  applications_limit: {
    name: 'Applications',
    limited: '{{count, number}} application',
    limited_other: '{{count, number}} applications',
    unlimited: 'Applications illimitées',
  },
  machine_to_machine_limit: {
    name: 'Machine à machine',
    limited: '{{count, number}} application machine à machine',
    limited_other: '{{count, number}} applications machine à machine',
    unlimited: 'Applications machine à machine illimitées',
  },
  resources_limit: {
    name: 'Ressources API',
    limited: '{{count, number}} ressource API',
    limited_other: '{{count, number}} ressources API',
    unlimited: 'Ressources API illimitées',
  },
  scopes_per_resource_limit: {
    name: 'Permissions de ressource',
    limited: '{{count, number}} permission par ressource',
    limited_other: '{{count, number}} permissions par ressource',
    unlimited: 'Permission par ressource illimitée',
  },
  custom_domain_enabled: {
    name: 'Domaine personnalisé',
    limited: 'Domaine personnalisé',
    unlimited: 'Domaine personnalisé',
  },
  omni_sign_in_enabled: {
    name: 'Omni sign-in',
    limited: 'Omni sign-in',
    unlimited: 'Omni sign-in',
  },
  built_in_email_connector_enabled: {
    name: 'Connecteur e-mail intégré',
    limited: 'Connecteur e-mail intégré',
    unlimited: 'Connecteur e-mail intégré',
  },
  social_connectors_limit: {
    name: 'Connecteurs sociaux',
    limited: '{{count, number}} connecteur social',
    limited_other: '{{count, number}} connecteurs sociaux',
    unlimited: 'Connecteurs sociaux illimités',
  },
  standard_connectors_limit: {
    name: 'Connecteurs standard gratuits',
    limited: '{{count, number}} connecteur standard gratuit',
    limited_other: '{{count, number}} connecteurs standard gratuits',
    unlimited: 'Connecteurs standard gratuits illimités',
  },
  roles_limit: {
    name: 'Rôles',
    limited: '{{count, number}} rôle',
    limited_other: '{{count, number}} rôles',
    unlimited: 'Rôles illimités',
  },
  scopes_per_role_limit: {
    name: 'Permissions de rôle',
    limited: '{{count, number}} permission par rôle',
    limited_other: '{{count, number}} permissions par rôle',
    unlimited: 'Permission par rôle illimitée',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} hook',
    limited_other: '{{count, number}} hooks',
    unlimited: 'Hooks illimités',
  },
  audit_logs_retention_days: {
    name: "Conservation des journaux d'audit",
    limited: "Conservation des journaux d'audit : {{count, number}} jour",
    limited_other: "Conservation des journaux d'audit : {{count, number}} jours",
    unlimited: 'Jours illimités',
  },
  community_support_enabled: {
    name: 'Support de la communauté',
    limited: 'Support de la communauté',
    unlimited: 'Support de la communauté',
  },
  customer_ticket_support: {
    name: 'Support client par ticket',
    limited: '{{count, number}} heure de support client par ticket',
    limited_other: '{{count, number}} heures de support client par ticket',
    unlimited: 'Support client par ticket',
  },
};

export default quota_item;
