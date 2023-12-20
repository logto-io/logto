const quota_table = {
  quota: {
    title: 'Cota',
    tenant_limit: 'Limite de inquilino',
    base_price: 'Preço base',
    mau_unit_price: '* Preço unitário de MAU',
    mau_limit: 'Limite de MAU',
  },
  application: {
    title: 'Aplicações',
    total: 'Total de aplicações',
    m2m: 'Aplicação máquina-a-máquina',
  },
  resource: {
    title: 'Recursos de API',
    resource_count: 'Contagem de recursos',
    scopes_per_resource: 'Permissões por recurso',
  },
  branding: {
    title: 'Interface de usuário e branding',
    custom_domain: 'Domínio personalizado',
    custom_css: 'CSS personalizado',
    app_logo_and_favicon: 'Logotipo da aplicação e favicon',
    dark_mode: 'Modo escuro',
    i18n: 'Internacionalização',
  },
  user_authn: {
    title: 'Autenticação de usuário',
    omni_sign_in: 'Entrada Omni',
    password: 'Senha',
    passwordless: 'Sem senha - E-mail e SMS',
    email_connector: 'Conector de e-mail',
    sms_connector: 'Conector de SMS',
    social_connectors: 'Conectores sociais',
    standard_connectors: 'Conectores padrão',
    built_in_email_connector: 'Conector de e-mail integrado',
    mfa: 'MFA',
    sso: 'SSO Empresarial',
  },
  user_management: {
    title: 'Gerenciamento de usuários',
    user_management: 'Gerenciamento de usuários',
    roles: 'Funções',
    /** UNTRANSLATED */
    machine_to_machine_roles: 'Machine-to-machine roles',
    scopes_per_role: 'Permissões por função',
  },
  audit_logs: {
    title: 'Registros de auditoria',
    retention: 'Retenção',
  },
  hooks: {
    title: 'Webhooks',
    hooks: 'Webhooks',
  },
  organizations: {
    title: 'Organização',
    /** UNTRANSLATED */
    organizations: 'Organizations',
    /** UNTRANSLATED */
    monthly_active_organization: 'Monthly active organization',
    /** UNTRANSLATED */
    allowed_users_per_org: 'Allowed users per org',
    /** UNTRANSLATED */
    invitation: 'Invitation (Coming soon)',
    /** UNTRANSLATED */
    org_roles: 'Org roles',
    /** UNTRANSLATED */
    org_permissions: 'Org permissions',
    /** UNTRANSLATED */
    just_in_time_provisioning: 'Just-in-time provisioning',
  },
  support: {
    title: 'Suporte',
    community: 'Comunidade',
    customer_ticket: 'Ticket de suporte',
    premium: 'Premium',
  },
  mau_unit_price_footnote:
    '* Seus usuários ativos mensais (MAU) são divididos em 3 níveis com base em quantas vezes eles fazem login durante o ciclo de faturamento. Cada nível tem um preço diferente por unidade de MAU.',
  unlimited: 'Ilimitado',
  contact: 'Contato',
  monthly_price: '${ { value, number } }/mês',
  mau_price: '${ { value, number } }/MAU',
  days_one: '${ { count, number } } dia',
  days_other: '${ { count, number } } dias',
  add_on: 'Adicional',
  tier: 'Nível${ { value, number } }: ',
  /** UNTRANSLATED */
  free_token_limit_tip: 'Free for {{value}}M token issued.',
  /** UNTRANSLATED */
  paid_token_limit_tip:
    'Free for {{value}}M token issued. We may add charges if you go beyond {{value}}M tokens once we finalize the prices.',
  /** UNTRANSLATED */
  paid_quota_limit_tip:
    'We may add charges for features that go beyond your quota limit as add-ons once we finalize the prices.',
  /** UNTRANSLATED */
  beta_feature_tip:
    'Free to use during the beta phase. We will begin charging once we finalize the add-on pricing.',
  /** UNTRANSLATED */
  usage_based_beta_feature_tip:
    'Free to use during the beta phase. We will begin charging once we finalize the org usage-based pricing.',
  /** UNTRANSLATED */
  beta: 'Beta',
  /** UNTRANSLATED */
  add_on_beta: 'Add-on (Beta)',
};

export default Object.freeze(quota_table);
