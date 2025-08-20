const featured_plan_content = {
  mau: {
    free_plan: 'Bis zu {{count, number}} MAU',
    pro_plan: 'Unbegrenzte MAU',
  },
  m2m: {
    free_plan: '{{count, number}} Maschine-zu-Maschine',
    pro_plan: 'Zusätzliche Maschine-zu-Maschine',
  },
  saml_and_third_party_apps: 'SAML-Apps & Drittanbieter-Apps',
  third_party_apps: 'IdP für Drittanbieteranwendungen',
  mfa: 'Multi-Faktor-Authentifizierung',
  sso: 'Unternehmens-SSO',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} Rolle und {{permissionCount, number}} Berechtigung pro Rolle',
    pro_plan: 'Unbegrenzte Rollen und Berechtigungen pro Rolle',
  },
  rbac: 'Rollenbasierte Zugriffskontrolle',
  organizations: 'Organisationen',
  audit_logs: 'Audit-Logs Speicherung: {{count, number}} Tage',
};

export default Object.freeze(featured_plan_content);
