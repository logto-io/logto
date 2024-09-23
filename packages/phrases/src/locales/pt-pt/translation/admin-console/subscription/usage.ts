const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'Um MAU é um utilizador único que trocou pelo menos um token com o Logto dentro de um ciclo de faturação. Ilimitado para o Plano Pro. <a>Saiba mais</a>',
  },
  organizations: {
    title: 'Organizações',
    description: '{{usage}}',
    tooltip:
      'Funcionalidade adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de organizações ou pelo nível de atividade destas.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'Funcionalidade adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de fatores de autenticação usados.',
  },
  enterprise_sso: {
    title: 'SSO Empresarial',
    description: '{{usage}}',
    tooltip: 'Funcionalidade adicional com um preço de ${{price, number}} por conexão SSO por mês.',
  },
  api_resources: {
    title: 'Recursos API',
    description: '{{usage}} <span>(Grátis para os primeiros 3)</span>',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por recurso por mês. Os primeiros 3 recursos API são gratuitos.',
  },
  machine_to_machine: {
    title: 'Máquina-para-máquina',
    description: '{{usage}} <span>(Grátis para o primeiro 1)</span>',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por aplicação por mês. A primeira aplicação máquina-para-máquina é gratuita.',
  },
  tenant_members: {
    title: 'Membros do arrendatário',
    description: '{{usage}} <span>(Grátis para os primeiros 3)</span>',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por membro por mês. Os primeiros 3 membros do arrendatário são gratuitos.',
  },
  tokens: {
    title: 'Tokens',
    description: '{{usage}}',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por milhão de tokens. O primeiro milhão de tokens está incluído.',
  },
  hooks: {
    title: 'Hooks',
    description: '{{usage}} <span>(Grátis para os primeiros 10)</span>',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por hook. Os primeiros 10 hooks estão incluídos.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Se fizeres alterações durante o ciclo de faturação atual, a tua próxima fatura poderá ser ligeiramente mais alta no primeiro mês após a alteração. Será o preço base de ${{price, number}} mais os custos adicionais para o uso não faturado do ciclo atual e a cobrança total para o próximo ciclo. <a>Saiba mais</a>',
  },
};

export default Object.freeze(usage);
