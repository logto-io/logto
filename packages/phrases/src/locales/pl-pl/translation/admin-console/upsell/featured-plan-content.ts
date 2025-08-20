const featured_plan_content = {
  mau: {
    free_plan: 'Do {{count, number}} MAU',
    pro_plan: 'Nieograniczony MAU',
  },
  m2m: {
    free_plan: '{{count, number}} urządzenia do urządzenia',
    pro_plan: 'Dodatkowe urządzenie do urządzenia',
  },
  saml_and_third_party_apps: 'Aplikacje SAML i aplikacje innych firm',
  third_party_apps: 'IdP dla aplikacji innych firm',
  mfa: 'Autoryzacja wieloskładnikowa',
  sso: 'SSO dla przedsiębiorstw',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} rola i {{permissionCount, number}} uprawnienie na rolę',
    pro_plan: 'Nieograniczone role i uprawnienia na rolę',
  },
  rbac: 'Kontrola dostępu oparta na rolach',
  organizations: 'Organizacje',
  audit_logs: 'Przechowywanie dzienników audytu: {{count, number}} dni',
};

export default Object.freeze(featured_plan_content);
