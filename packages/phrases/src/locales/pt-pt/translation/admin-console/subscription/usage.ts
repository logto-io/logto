const usage = {
  status_active: 'Em uso',
  status_inactive: 'Não em uso',
  limited_status_quota_description: '(Primeiros {{quota}} incluídos)',
  unlimited_status_quota_description: '(Incluídos)',
  disabled_status_quota_description: '(Não incluídos)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (Ilimitado)</span>',
  usage_description_with_limited_quota:
    '{{usage}}<span> (Primeiros {{basicQuota}} incluídos)</span>',
  usage_description_without_quota: '{{usage}}<span> (Não incluídos)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Um MAU é um utilizador único que trocou pelo menos um token com o Logto dentro de um ciclo de faturação. Ilimitado para o Plano Pro. <a>Saiba mais</a>',
    tooltip_for_enterprise:
      'Um MAU é um utilizador único que trocou pelo menos um token com o Logto dentro de um ciclo de faturação. Ilimitado para o Plano Empresarial.',
  },
  organizations: {
    title: 'Organizações',
    tooltip:
      'Funcionalidade adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de organizações ou pelo nível de atividade destas.',
    description_for_enterprise: '(Incluídos)',
    tooltip_for_enterprise:
      'A inclusão depende do teu plano. Se a funcionalidade de organização não estiver no teu contrato inicial, será adicionada à tua fatura quando a ativares. O complemento custa ${{price, number}}/mês, independentemente do número de organizações ou da sua atividade.',
    tooltip_for_enterprise_with_numbered_basic_quota:
      'O teu plano inclui as primeiras {{basicQuota}} organizações gratuitamente. Se precisares de mais, podes adicioná-las com o complemento de organização a uma taxa fixa de ${{price, number}} por mês, independentemente do número de organizações ou do nível de atividade destas.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Funcionalidade adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de fatores de autenticação usados.',
    tooltip_for_enterprise:
      'A inclusão depende do teu plano. Se a funcionalidade de MFA não estiver no teu contrato inicial, será adicionada à tua fatura quando a ativares. O complemento custa ${{price, number}}/mês, independentemente do número de fatores de autenticação usados.',
  },
  enterprise_sso: {
    title: 'SSO Empresarial',
    tooltip: 'Funcionalidade adicional com um preço de ${{price, number}} por conexão SSO por mês.',
    tooltip_for_enterprise:
      'Funcionalidade extra com um preço de ${{price, number}} por conexão SSO por mês. As primeiras {{basicQuota}} SSO estão incluídas e são gratuitas no teu plano baseado em contrato.',
  },
  api_resources: {
    title: 'Recursos API',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por recurso por mês. Os primeiros 3 recursos API são gratuitos.',
    tooltip_for_enterprise:
      'Os primeiros {{basicQuota}} recursos API estão incluídos e são gratuitos no teu plano baseado em contrato. Se precisares de mais, ${{price, number}} por recurso API por mês.',
  },
  machine_to_machine: {
    title: 'Máquina-para-máquina',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por aplicação por mês. A primeira aplicação máquina-para-máquina é gratuita.',
    tooltip_for_enterprise:
      'A primeira {{basicQuota}} aplicação máquina-para-máquina é gratuita no teu plano baseado em contrato. Se precisares de mais, ${{price, number}} por aplicação por mês.',
  },
  tenant_members: {
    title: 'Membros do arrendatário',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por membro por mês. O primeiro {{count}} membro do arrendatário é gratuito.',
    tooltip_one:
      'Funcionalidade adicional com um preço de ${{price, number}} por membro por mês. O primeiro {{count}} membro do arrendatário é gratuito.',
    tooltip_other:
      'Funcionalidade adicional com um preço de ${{price, number}} por membro por mês. Os primeiros {{count}} membros do arrendatário são gratuitos.',
    tooltip_for_enterprise:
      'Os primeiros {{basicQuota}} membros do arrendatário estão incluídos e são gratuitos no teu plano baseado em contrato. Se precisares de mais, ${{price, number}} por membro do arrendatário por mês.',
  },
  tokens: {
    title: 'Tokens',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por {{tokenLimit}} de tokens. O primeiro {{basicQuota}} de tokens está incluído.',
    tooltip_for_enterprise:
      'Os primeiros {{basicQuota}} tokens estão incluídos e são gratuitos no teu plano baseado em contrato. Se precisares de mais, ${{price, number}} por {{tokenLimit}} de tokens por mês.',
  },
  hooks: {
    title: 'Hooks',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por hook. Os primeiros 10 hooks estão incluídos.',
    tooltip_for_enterprise:
      'Os primeiros {{basicQuota}} hooks estão incluídos e são gratuitos no teu plano baseado em contrato. Se precisares de mais, ${{price, number}} por hook por mês.',
  },
  security_features: {
    title: 'Segurança avançada',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}}/mês para o pacote completo de segurança avançada, incluindo CAPTCHA, bloqueio de identificador, lista de bloqueio de e-mail, e mais.',
  },
  saml_applications: {
    title: 'Aplicação SAML',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}} por aplicação SAML por mês.',
  },
  third_party_applications: {
    title: 'Aplicação de terceiros',
    tooltip: 'Funcionalidade adicional com um preço de ${{price, number}} por aplicação por mês.',
  },
  rbacEnabled: {
    title: 'Funções',
    tooltip:
      'Funcionalidade adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de funções globais.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Se fizeres alterações durante o ciclo de faturação atual, a tua próxima fatura poderá ser ligeiramente mais alta no primeiro mês após a alteração. Será o preço base de ${{price, number}} mais os custos adicionais para o uso não faturado do ciclo atual e a cobrança total para o próximo ciclo. <a>Saiba mais</a>',
  },
};

export default Object.freeze(usage);
