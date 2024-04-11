const quota_table = {
  quota: {
    title: 'Básico',
    base_price: 'Preço base',
    mau_limit: 'Limite de MAU',
    included_tokens: 'Tokens incluídos',
  },
  application: {
    title: 'Aplicações',
    total: 'Total de aplicações',
    m2m: 'Aplicação máquina-a-máquina',
    /** UNTRANSLATED */
    third_party: 'Third-party apps',
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
    mfa: 'Autenticação multifator',
    sso: 'SSO Empresarial',
    adaptive_mfa: 'MFA adaptativo',
  },
  user_management: {
    title: 'Gerenciamento de usuários',
    user_management: 'Gerenciamento de usuários',
    roles: 'Funções',
    machine_to_machine_roles: 'Funções de máquina-a-máquina',
    scopes_per_role: 'Permissões por função',
  },
  organizations: {
    title: 'Organização',
    organizations: 'Organizações',
    monthly_active_organization: 'Organização ativa mensal',
    allowed_users_per_org: 'Usuários permitidos por organização',
    invitation: 'Convite',
    org_roles: 'Funções de organização',
    org_permissions: 'Permissões de organização',
    just_in_time_provisioning: 'Provisionamento just-in-time',
  },
  support: {
    title: 'Conformidade e suporte',
    community: 'Comunidade',
    customer_ticket: 'Ticket de suporte',
    premium: 'Premium',
    email_ticket_support: 'Suporte via e-mail',
    soc2_report: 'Relatório SOC2',
    hipaa_or_baa_report: 'Relatório HIPAA/BAA',
  },
  developers_and_platform: {
    /** UNTRANSLATED */
    title: 'Developers and platform',
    /** UNTRANSLATED */
    hooks: 'Webhooks',
    /** UNTRANSLATED */
    audit_logs_retention: 'Audit logs retention',
    /** UNTRANSLATED */
    jwt_claims: 'JWT claims',
    /** UNTRANSLATED */
    tenant_members: 'Tenant members',
  },
  unlimited: 'Ilimitado',
  contact: 'Contato',
  monthly_price: '${ { value, number } }/mês',
  days_one: '${ { count, number } } dia',
  days_other: '${ { count, number } } dias',
  add_on: 'Adicional',
  tier: 'Nível${ { value, number } }: ',
  paid_token_limit_tip:
    'O Logto adicionará cobranças para recursos que ultrapassem o limite da sua cota. Você pode usá-lo gratuitamente até começarmos a cobrar por volta do segundo trimestre de 2024. Se precisar de mais tokens, entre em contato conosco. Por padrão, cobramos $80 por mês para cada milhão de tokens.',
  paid_quota_limit_tip:
    'O Logto adicionará cobranças por recursos que ultrapassarem seu limite de cota. Você pode usá-lo gratuitamente até começarmos a cobrar, aproximadamente no segundo trimestre de 2024.',
  paid_add_on_feature_tip:
    'Esta é uma função adicional. Você pode usá-la gratuitamente até começarmos a cobrar, aproximadamente no segundo trimestre de 2024.',
  million: '{{value, number}} milhão',
  mau_tip:
    'MAU (usuários ativos mensais) significa o número de usuários únicos que trocaram pelo menos um token com o Logto em um ciclo de faturamento.',
  tokens_tip:
    'Todos os tipos de tokens emitidos pelo Logto, incluindo token de acesso, token de atualização, etc.',
  mao_tip:
    'MAO (Organização Ativa Mensal) significa o número de organizações únicas que têm pelo menos um MAU (Usuário Ativo Mensal) em um ciclo de faturamento.',
  /** UNTRANSLATED */
  third_party_tip:
    'Use Logto as your OIDC identity provider for third-party app sign-ins and permission grants.',
  included: 'incluído{{value, number}}',
  included_mao: '{{value, number}} MAO incluído',
  extra_quota_price: 'Então ${{value, number}} por mês / cada depois',
  per_month_each: '${{value, number}} por mês / cada',
  extra_mao_price: 'Então ${{value, number}} por MAO',
  per_month: '${{value, number}} por mês',
  /** UNTRANSLATED */
  per_member: 'Then ${{value, number}} per member',
};

export default Object.freeze(quota_table);
