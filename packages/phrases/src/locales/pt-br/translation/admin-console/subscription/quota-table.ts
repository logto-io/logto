const quota_table = {
  quota: {
    title: 'Cota',
    tenant_limit: 'Limite de inquilino',
    base_price: 'Preço base',
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
    machine_to_machine_roles: 'Funções de máquina-a-máquina',
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
    organizations: 'Organizações',
    monthly_active_organization: 'Organização ativa mensal',
    allowed_users_per_org: 'Usuários permitidos por organização',
    invitation: 'Convite (Em breve)',
    org_roles: 'Funções de organização',
    org_permissions: 'Permissões de organização',
    just_in_time_provisioning: 'Provisionamento just-in-time',
  },
  support: {
    /** UNTRANSLATED */
    title: 'Compliance and support',
    community: 'Comunidade',
    customer_ticket: 'Ticket de suporte',
    premium: 'Premium',
    /** UNTRANSLATED */
    email_ticket_support: 'Email ticket support',
    /** UNTRANSLATED */
    soc2_report: 'SOC2 report (Coming soon)',
    /** UNTRANSLATED */
    hipaa_or_baa_report: 'HIPAA/BAA report (Coming soon)',
  },
  unlimited: 'Ilimitado',
  contact: 'Contato',
  monthly_price: '${ { value, number } }/mês',
  days_one: '${ { count, number } } dia',
  days_other: '${ { count, number } } dias',
  add_on: 'Adicional',
  tier: 'Nível${ { value, number } }: ',
  free_token_limit_tip: 'Grátis para {{value}}M tokens emitidos.',
  paid_token_limit_tip:
    'Grátis para {{value}}M tokens emitidos. Podemos cobrar se você ultrapassar {{value}}M tokens após finalizarmos os preços.',
  paid_quota_limit_tip:
    'Podemos adicionar cobranças para recursos que ultrapassarem o limite da sua cota como complementos, uma vez que finalizarmos os preços.',
  beta_feature_tip:
    'Grátis durante a fase beta. Começaremos a cobrar uma vez que finalizarmos os preços dos complementos.',
  usage_based_beta_feature_tip:
    'Grátis durante a fase beta. Começaremos a cobrar uma vez que finalizarmos os preços baseados no uso da organização.',
  beta: 'Beta',
  add_on_beta: 'Complemento (Beta)',
};

export default Object.freeze(quota_table);
