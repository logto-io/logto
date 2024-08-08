const featured_plan_content = {
  mau: {
    free_plan: 'حتى {{count, number}} MAU',
    pro_plan: 'MAU غير محدود',
  },
  m2m: {
    free_plan: '{{count, number}} جهاز إلى جهاز',
    pro_plan: 'جهاز إلى جهاز إضافي',
  },
  third_party_apps: 'IdP لتطبيقات الطرف الثالث',
  mfa: 'المصادقة متعددة العوامل',
  sso: 'SSO المؤسسي',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} دور و {{permissionCount, number}} إذن لكل دور',
    pro_plan: 'أدوار وأذونات غير محدودة لكل دور',
  },
  organizations: 'المؤسسات',
  audit_logs: 'احتفاظ بسجلات التدقيق: {{count, number}} أيام',
};

export default Object.freeze(featured_plan_content);
