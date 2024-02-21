const featured_plan_content = {
  mau: {
    free_plan: '{{count, number}} MAUまで',
    pro_plan: 'MAU無制限',
  },
  m2m: {
    free_plan: '{{count, number}}機器間',
    pro_plan: '追加の機器間',
  },
  third_party_apps: 'サードパーティアプリケーションのIdP',
  mfa: 'マルチファクタ認証',
  sso: '企業SSO',
  role_and_permissions: {
    free_plan: '{{roleCount, number}}ロールと{{permissionCount, number}}ロールごとの権限',
    pro_plan: 'ロールごとの無制限の役割と権限',
  },
  organizations: '組織',
  audit_logs: '監査ログ保持: {{count, number}} 日間',
};

export default Object.freeze(featured_plan_content);
