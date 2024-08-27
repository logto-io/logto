const quota_table = {
  quota: {
    title: 'الأساسيات',
    base_price: 'السعر الأساسي',
    mau_limit: 'حد MAU',
    included_tokens: 'الرموز المضمنة',
  },
  application: {
    title: 'التطبيقات',
    total: 'إجمالي التطبيقات',
    m2m: 'تطبيقات من الجهاز إلى الجهاز',
    third_party: 'تطبيقات الطرف الثالث',
  },
  resource: {
    title: 'موارد واجهة برمجة التطبيقات',
    resource_count: 'عدد الموارد',
    scopes_per_resource: 'أذونات لكل مورد',
  },
  branding: {
    title: 'واجهة المستخدم والعلامة التجارية',
    custom_domain: 'نطاق مخصص',
    custom_css: 'CSS مخصص',
    logo_and_favicon: 'شعار ورمز الموقع',
    bring_your_ui: 'اجلب واجهتك الخاصة',
    dark_mode: 'الوضع الداكن',
    i18n: 'التعدد اللغوي',
  },
  user_authn: {
    title: 'مصادقة المستخدم',
    omni_sign_in: 'تسجيل الدخول الموحد',
    password: 'كلمة المرور',
    passwordless: 'بدون كلمة مرور - البريد الإلكتروني والرسائل القصيرة',
    email_connector: 'موصل البريد الإلكتروني',
    sms_connector: 'موصل الرسائل القصيرة',
    social_connectors: 'موصلات التواصل الاجتماعي',
    standard_connectors: 'موصلات قياسية',
    built_in_email_connector: 'موصل البريد الإلكتروني المدمج',
    mfa: 'المصادقة متعددة العوامل',
    sso: 'SSO المؤسسية',
    impersonation: 'التمثيل',
  },
  user_management: {
    title: 'إدارة المستخدمين',
    user_management: 'إدارة المستخدمين',
    roles: 'الأدوار',
    machine_to_machine_roles: 'أدوار من الجهاز إلى الجهاز',
    scopes_per_role: 'أذونات لكل دور',
  },
  organizations: {
    title: 'المؤسسات',
    organizations: 'المؤسسات',
    organization: 'المؤسسة',
    organization_count: 'عدد المؤسسات',
    allowed_users_per_org: 'المستخدمين لكل مؤسسة',
    invitation: 'الدعوة (واجهة برمجة التطبيقات للإدارة)',
    org_roles: 'أدوار المؤسسة',
    org_permissions: 'أذونات المؤسسة',
    just_in_time_provisioning: 'التوفير في الوقت المناسب',
  },
  support: {
    title: 'الامتثال والدعم',
    community: 'المجتمع',
    customer_ticket: 'دعم التذاكر',
    premium: 'متميز',
    email_ticket_support: 'دعم التذاكر عبر البريد الإلكتروني',
    /** UNTRANSLATED */
    discord_private_channel: 'Discord private channel',
    /** UNTRANSLATED */
    premium_support: 'Premium support',
    /** UNTRANSLATED */
    developer_onboarding: 'Developer onboarding',
    /** UNTRANSLATED */
    solution_engineer_support: 'Solution engineer',
    /** UNTRANSLATED */
    sla: 'SLA',
    /** UNTRANSLATED */
    dedicated_computing_resources: 'Dedicated computing resources',
  },
  compliance: {
    /** UNTRANSLATED */
    title: 'Compliance',
    /** UNTRANSLATED */
    soc2_compliant: 'SOC2 compliant',
    /** UNTRANSLATED */
    soc2_report: 'SOC2 report',
    /** UNTRANSLATED */
    hipaa_or_baa_report: 'HIPAA/BAA report',
  },
  developers_and_platform: {
    title: 'المطورين والمنصة',
    hooks: 'الخطافات',
    audit_logs_retention: 'احتفاظ بسجلات التدقيق',
    jwt_claims: 'مطالبات JWT',
    tenant_members: 'أعضاء المستأجر',
  },
  unlimited: 'غير محدود',
  contact: 'اتصل',
  monthly_price: '${{value, number}}/شهر',
  days_one: '{{count, number}} يوم',
  days_other: '{{count, number}} أيام',
  add_on: 'إضافة',
  tier: 'المستوى {{value, number}}: ',
  million: '{{value, number}} مليون',
  mau_tip:
    'MAU (المستخدم النشط شهريًا) يعني عدد المستخدمين الفريدة الذين قاموا بتبادل رمز واحد على الأقل مع Logto في دورة الفوترة.',
  tokens_tip: 'جميع أنواع الرموز التي تصدرها Logto ، بما في ذلك رمز الوصول ورمز التحديث ، إلخ.',
  mao_tip:
    'MAO (المؤسسة النشطة شهريًا) يعني عدد المؤسسات الفريدة التي لديها مستخدم نشط شهريًا واحد على الأقل في دورة الفوترة.',
  third_party_tip:
    'استخدم Logto كموفر هوية OIDC الخاص بك لتسجيل الدخول ومنح الأذونات لتطبيقات الطرف الثالث.',
  included: '{{value, number}} مضمن',
  included_mao: '{{value, number}} MAO مضمنة',
  extra_quota_price: 'ثم ${{value, number}} شهريًا / لكل واحد بعد ذلك',
  per_month_each: '${{value, number}} شهريًا / لكل واحد',
  extra_mao_price: 'ثم ${{value, number}} شهريًا لكل MAO',
  per_month: '${{value, number}} شهريًا',
  per_member: 'ثم ${{value, number}} لكل عضو',
};

export default Object.freeze(quota_table);
