const quota_item = {
  tenant_limit: {
    name: 'Inquilinos',
    limited: '{{count, number}} inquilino',
    limited_other: '{{count, number}} inquilinos',
    unlimited: 'Inquilinos ilimitados',
  },
  mau_limit: {
    name: 'Usuários ativos mensais',
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
    name: 'Machine to machine',
    limited: '{{count, number}} aplicativo de machine to machine',
    limited_other: '{{count, number}} aplicativos de machine to machine',
    unlimited: 'Aplicativos de machine to machine ilimitados',
  },
  resources_limit: {
    name: 'Recursos da API',
    limited: '{{count, number}} recurso da API',
    limited_other: '{{count, number}} recursos da API',
    unlimited: 'Recursos da API ilimitados',
  },
  scopes_per_resource_limit: {
    name: 'Permissões de recurso',
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
    name: 'Omni sign-in',
    limited: 'Omni sign-in',
    unlimited: 'Omni sign-in',
  },
  built_in_email_connector_enabled: {
    name: 'Conector de e-mail integrado',
    limited: 'Conector de e-mail integrado',
    unlimited: 'Conector de e-mail integrado',
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
    name: 'Permissões de função',
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
    name: 'Reter logs de auditoria',
    limited: 'Retenção de logs de auditoria: {{count, number}} dia',
    limited_other: 'Retenção de logs de auditoria: {{count, number}} dias',
    unlimited: 'Dias ilimitados',
  },
  community_support_enabled: {
    name: 'Suporte da comunidade',
    limited: 'Suporte da comunidade',
    unlimited: 'Suporte da comunidade',
  },
  customer_ticket_support: {
    name: 'Suporte de ticket do cliente',
    limited: '{{count, number}} hora de suporte de ticket do cliente',
    limited_other: '{{count, number}} horas de suporte de ticket do cliente',
    unlimited: 'Suporte de ticket do cliente',
  },
};

export default quota_item;
