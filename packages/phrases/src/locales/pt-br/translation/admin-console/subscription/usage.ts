const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'Um MAU é um usuário único que trocou pelo menos um token com o Logto dentro de um ciclo de faturamento. Ilimitado para o Plano Pro. <a>Saiba mais</a>',
  },
  organizations: {
    title: 'Organizações',
    description: '{{usage}}',
    tooltip:
      'Recurso adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de organizações ou seu nível de atividade.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'Recurso adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de fatores de autenticação utilizados.',
  },
  enterprise_sso: {
    title: 'SSO Empresarial',
    description: '{{usage}}',
    tooltip: 'Recurso adicional com um preço de ${{price, number}} por conexão SSO por mês.',
  },
  api_resources: {
    title: 'Recursos de API',
    description: '{{usage}} <span>(Grátis para os primeiros 3)</span>',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por recurso por mês. Os primeiros 3 recursos de API são gratuitos.',
  },
  machine_to_machine: {
    title: 'Máquina para máquina',
    description: '{{usage}} <span>(Grátis para o primeiro 1)</span>',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por aplicativo por mês. O primeiro aplicativo máquina para máquina é gratuito.',
  },
  tenant_members: {
    title: 'Membros do locatário',
    description: '{{usage}} <span>(Grátis para os primeiros 3)</span>',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por membro por mês. Os primeiros 3 membros do locatário são gratuitos.',
  },
  tokens: {
    title: 'Tokens',
    description: '{{usage}}',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por milhão de tokens. O primeiro 1 milhão de tokens está incluído.',
  },
  hooks: {
    title: 'Hooks',
    description: '{{usage}} <span>(Grátis para os primeiros 10)</span>',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por hook. Os primeiros 10 hooks estão incluídos.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Se fizer quaisquer alterações durante o ciclo de faturamento atual, sua próxima fatura pode ser ligeiramente mais alta no primeiro mês após a mudança. Será o preço base de ${{price, number}} mais os custos adicionais para o uso não faturado do ciclo atual e a cobrança total para o próximo ciclo. <a>Saiba mais</a>',
  },
};

export default Object.freeze(usage);
