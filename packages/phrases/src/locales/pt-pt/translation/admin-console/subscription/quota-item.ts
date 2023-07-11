const quota_item = {
  tenant_limit: {
    name: 'Inquilinos',
    limited: '{{count, number}} inquilino',
    limited_other: '{{count, number}} inquilinos',
    unlimited: 'Inquilinos ilimitados',
  },
  mau_limit: {
    name: 'Utilizadores ativos mensais',
    limited: '{{count, number}} UAM',
    unlimited: 'UAM ilimitados',
  },
  applications_limit: {
    name: 'Aplicações',
    limited: '{{count, number}} aplicação',
    limited_other: '{{count, number}} aplicações',
    unlimited: 'Aplicações ilimitadas',
  },
  machine_to_machine_limit: {
    name: 'Aplicações máquina-a-máquina',
    limited: '{{count, number}} aplicação máquina-a-máquina',
    limited_other: '{{count, number}} aplicações máquina-a-máquina',
    unlimited: 'Aplicações máquina-a-máquina ilimitadas',
  },
  resources_limit: {
    name: 'Recursos de API',
    limited: '{{count, number}} recurso de API',
    limited_other: '{{count, number}} recursos de API',
    unlimited: 'Recursos de API ilimitados',
  },
  scopes_per_resource_limit: {
    name: 'Permissões de recursos',
    limited: '{{count, number}} permissão por recurso',
    limited_other: '{{count, number}} permissões por recurso',
    unlimited: 'Permissão por recurso ilimitada',
  },
  custom_domain_enabled: {
    name: 'Domínio personalizado',
    limited: 'Domínio personalizado',
    unlimited: 'Domínio personalizado',
  },
  omni_sign_in_enabled: {
    name: 'Início de sessão Omni',
    limited: 'Início de sessão Omni',
    unlimited: 'Início de sessão Omni',
  },
  built_in_email_connector_enabled: {
    name: 'Conector de email incorporado',
    limited: 'Conector de email incorporado',
    unlimited: 'Conector de email incorporado',
  },
  social_connectors_limit: {
    name: 'Conectores sociais',
    limited: '{{count, number}} conector social',
    limited_other: '{{count, number}} conectores sociais',
    unlimited: 'Conectores sociais ilimitados',
  },
  standard_connectors_limit: {
    name: 'Conectores padrão gratuitos',
    limited: '{{count, number}} conector padrão gratuito',
    limited_other: '{{count, number}} conectores padrão gratuitos',
    unlimited: 'Conectores padrão ilimitados',
  },
  roles_limit: {
    name: 'Funções',
    limited: '{{count, number}} função',
    limited_other: '{{count, number}} funções',
    unlimited: 'Funções ilimitadas',
  },
  scopes_per_role_limit: {
    name: 'Permissões de funções',
    limited: '{{count, number}} permissão por função',
    limited_other: '{{count, number}} permissões por função',
    unlimited: 'Permissão por função ilimitada',
  },
  hooks_limit: {
    name: 'Hooks',
    limited: '{{count, number}} hook',
    limited_other: '{{count, number}} hooks',
    unlimited: 'Hooks ilimitados',
  },
  audit_logs_retention_days: {
    name: 'Conservação de registos de auditoria',
    limited: 'Audit logs retention: {{count, number}} dia',
    limited_other: 'Audit logs retention: {{count, number}} dias',
    unlimited: 'Dias ilimitados',
  },
  community_support_enabled: {
    name: 'Apoio da comunidade',
    limited: 'Apoio da comunidade',
    unlimited: 'Apoio da comunidade',
  },
  customer_ticket_support: {
    name: 'Apoio de bilhetes ao cliente',
    limited: '{{count, number}} apoio de bilhetes ao cliente por hora',
    limited_other: '{{count, number}} apoio de bilhetes ao cliente por horas',
    unlimited: 'Apoio de bilhetes ao cliente',
  },
};

export default quota_item;
