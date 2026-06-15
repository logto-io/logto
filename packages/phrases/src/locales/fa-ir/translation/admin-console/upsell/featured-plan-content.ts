const featured_plan_content = {
  mau: {
    free_plan: 'تا {{count, number}} کاربر فعال ماهانه',
    pro_plan: 'کاربر فعال ماهانه نامحدود',
  },
  m2m: {
    free_plan: '{{count, number}} ماشین به ماشین',
    pro_plan: 'ماشین به ماشین اضافی',
  },
  saml_and_third_party_apps: 'برنامه‌های SAML و برنامه‌های شخص ثالث',
  third_party_apps: 'ارائه‌دهنده هویت برای برنامه‌های شخص ثالث',
  mfa: 'احراز هویت چندعاملی',
  sso: 'ورود یکپارچه سازمانی',
  role_and_permissions: {
    free_plan: '{{roleCount, number}} نقش و {{permissionCount, number}} مجوز در هر نقش',
    pro_plan: 'نقش‌ها و مجوزهای نامحدود در هر نقش',
  },
  rbac: 'کنترل دسترسی مبتنی بر نقش',
  organizations: 'سازمان‌ها',
  audit_logs: 'نگهداری گزارش‌های حسابرسی: {{count, number}} روز',
};

export default Object.freeze(featured_plan_content);
