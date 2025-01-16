const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  /** UNTRANSLATED */
  limited_status_quota_description: '(First {{quota}} included)',
  /** UNTRANSLATED */
  unlimited_status_quota_description: '(Included)',
  /** UNTRANSLATED */
  disabled_status_quota_description: '(Not included)',
  /** UNTRANSLATED */
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unlimited)</span>',
  /** UNTRANSLATED */
  usage_description_with_limited_quota: '{{usage}}<span> (First {{basicQuota}} included)</span>',
  /** UNTRANSLATED */
  usage_description_without_quota: '{{usage}}<span> (Not included)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Um MAU é um usuário único que trocou pelo menos um token com o Logto dentro de um ciclo de faturamento. Ilimitado para o Plano Pro. <a>Saiba mais</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'Organizações',
    tooltip:
      'Recurso adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de organizações ou seu nível de atividade.',
    /** UNTRANSLATED */
    description_for_enterprise: '(Included)',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
    /** UNTRANSLATED */
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Your plan includes the first {{basicQuota}} organizations for free. If you need more, you can add them with the organization add-on at a flat rate of ${{price, number}} per month, regardless of the number of organizations or their activity level.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Recurso adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de fatores de autenticação utilizados.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'SSO Empresarial',
    tooltip: 'Recurso adicional com um preço de ${{price, number}} por conexão SSO por mês.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'Recursos de API',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por recurso por mês. Os primeiros 3 recursos de API são gratuitos.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'Máquina para máquina',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por aplicativo por mês. O primeiro aplicativo máquina para máquina é gratuito.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'Membros do locatário',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por membro por mês. Os primeiros 3 membros do locatário são gratuitos.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'Tokens',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por {{tokenLimit}} de tokens. O primeiro {{basicQuota}} de tokens está incluído.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'Hooks',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por hook. Os primeiros 10 hooks estão incluídos.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Se fizer quaisquer alterações durante o ciclo de faturamento atual, sua próxima fatura pode ser ligeiramente mais alta no primeiro mês após a mudança. Será o preço base de ${{price, number}} mais os custos adicionais para o uso não faturado do ciclo atual e a cobrança total para o próximo ciclo. <a>Saiba mais</a>',
  },
};

export default Object.freeze(usage);
