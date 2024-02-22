const featured_plan_content = {
  mau: {
    free_plan: 'Até {{count, number}} MAU',
    pro_plan: 'MAU ilimitados',
  },
  m2m: {
    free_plan: '{{count, number}} de máquina para máquina',
    pro_plan: 'Máquina para máquina adicional',
  },
  third_party_apps: 'IdP para aplicações de terceiros',
  mfa: 'Autenticação de vários fatores',
  sso: 'SSO empresarial',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} função e {{permissionCount, number}} permissão por função',
    pro_plan: 'Funções e permissões ilimitadas por função',
  },
  organizations: 'Organizações',
  audit_logs: 'Retenção de logs de auditoria: {{count, number}} dias',
};

export default Object.freeze(featured_plan_content);
