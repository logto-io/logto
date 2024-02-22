const featured_plan_content = {
  mau: {
    free_plan: "Jusqu'à {{count, number}} MAU",
    pro_plan: 'MAU illimités',
  },
  m2m: {
    free_plan: '{{count, number}} machine à machine',
    pro_plan: 'Machine à machine supplémentaire',
  },
  third_party_apps: 'IdP pour les applications tierces',
  mfa: 'Authentification multi-facteurs',
  sso: 'SSO Entreprise',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} rôle et {{permissionCount, number}} permission par rôle',
    pro_plan: 'Rôles et permissions illimités par rôle',
  },
  organizations: 'Organisations',
  audit_logs: "Conservation des journaux d'audit: {{count, number}} jours",
};

export default Object.freeze(featured_plan_content);
