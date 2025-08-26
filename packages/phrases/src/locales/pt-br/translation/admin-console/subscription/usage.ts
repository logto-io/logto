const usage = {
  status_active: 'Em uso',
  status_inactive: 'Não está em uso',
  limited_status_quota_description: '(Primeiro {{quota}} incluído)',
  unlimited_status_quota_description: '(Incluído)',
  disabled_status_quota_description: '(Não incluído)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (Ilimitado)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (Primeiro {{basicQuota}} incluído)</span>',
  usage_description_without_quota: '{{usage}}<span> (Não incluído)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'Um MAU é um usuário único que trocou pelo menos um token com o Logto dentro de um ciclo de faturamento. Ilimitado para o Plano Pro. <a>Saiba mais</a>',
    tooltip_for_enterprise:
      'Um MAU é um usuário único que trocou pelo menos um token com o Logto dentro de um ciclo de faturamento. Ilimitado para o Plano Enterprise.',
  },
  organizations: {
    title: 'Organizações',
    tooltip:
      'Recurso adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de organizações ou seu nível de atividade.',
    description_for_enterprise: '(Incluído)',
    tooltip_for_enterprise:
      'A inclusão depende do seu plano. Se o recurso de organização não estiver no seu contrato inicial, ele será adicionado à sua fatura quando você ativá-lo. O complemento custa ${{price, number}}/mês, independentemente do número de organizações ou da sua atividade.',
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Seu plano inclui as primeiras {{basicQuota}} organizações gratuitamente. Se você precisar de mais, pode adicioná-las com o complemento de organização a uma taxa fixa de ${{price, number}} por mês, independentemente do número de organizações ou do nível de atividade delas.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Recurso adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de fatores de autenticação utilizados.',
    tooltip_for_enterprise:
      'A inclusão depende do seu plano. Se o recurso MFA não estiver no seu contrato inicial, ele será adicionado à sua fatura quando você ativá-lo. O complemento custa ${{price, number}}/mês, independentemente do número de fatores de autenticação utilizados.',
  },
  enterprise_sso: {
    title: 'SSO Empresarial',
    tooltip: 'Recurso adicional com um preço de ${{price, number}} por conexão SSO por mês.',
    tooltip_for_enterprise:
      'Recurso adicional com um preço de ${{price, number}} por conexão SSO por mês. Os primeiros {{basicQuota}} SSO estão incluídos e são gratuitos para usar no seu plano baseado em contrato.',
  },
  api_resources: {
    title: 'Recursos de API',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por recurso por mês. Os primeiros 3 recursos de API são gratuitos.',
    tooltip_for_enterprise:
      'Os primeiros {{basicQuota}} recursos de API estão incluídos e são gratuitos para usar no seu plano baseado em contrato. Se você precisar de mais, ${{price, number}} por recurso de API por mês.',
  },
  machine_to_machine: {
    title: 'Máquina para máquina',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por aplicativo por mês. O primeiro aplicativo máquina para máquina é gratuito.',
    tooltip_for_enterprise:
      'O primeiro {{basicQuota}} aplicativo máquina para máquina é gratuito para usar no seu plano baseado em contrato. Se você precisar de mais, ${{price, number}} por aplicativo por mês.',
  },
  tenant_members: {
    title: 'Membros do locatário',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por membro por mês. O primeiro {{count}} membro do locatário é gratuito.',
    tooltip_one:
      'Funcionalidade adicional com preço de ${{price, number}} por membro por mês. O primeiro {{count}} membro do locatário é gratuito.',
    tooltip_other:
      'Funcionalidade adicional com preço de ${{price, number}} por membro por mês. Os primeiros {{count}} membros do locatário são gratuitos.',
    tooltip_for_enterprise:
      'Os primeiros {{basicQuota}} membros do locatário estão incluídos e são gratuitos para usar no seu plano baseado em contrato. Se você precisar de mais, ${{price, number}} por membro do locatário por mês.',
  },
  tokens: {
    title: 'Tokens',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por {{tokenLimit}} de tokens. O primeiro {{basicQuota}} de tokens está incluído.',
    tooltip_for_enterprise:
      'O primeiro {{basicQuota}} de tokens está incluído e é gratuito para usar no seu plano baseado em contrato. Se você precisar de mais, ${{price, number}} por {{tokenLimit}} de tokens por mês.',
  },
  hooks: {
    title: 'Hooks',
    tooltip:
      'Recurso adicional com preço de ${{price, number}} por hook. Os primeiros 10 hooks estão incluídos.',
    tooltip_for_enterprise:
      'Os primeiros {{basicQuota}} hooks estão incluídos e são gratuitos para usar no seu plano baseado em contrato. Se você precisar de mais, ${{price, number}} por hook por mês.',
  },
  security_features: {
    title: 'Segurança avançada',
    tooltip:
      'Funcionalidade adicional com um preço de ${{price, number}}/mês para o pacote de segurança avançada completo, incluindo CAPTCHA, bloqueio de identificador, lista de bloqueio de e-mails, e mais.',
  },
  saml_applications: {
    title: 'Aplicativo SAML',
    tooltip: 'Recurso adicional com preço de ${{price, number}} por aplicativo SAML por mês.',
  },
  third_party_applications: {
    title: 'Aplicativo de terceiros',
    tooltip: 'Recurso adicional com preço de ${{price, number}} por aplicativo por mês.',
  },
  rbacEnabled: {
    title: 'Funções',
    tooltip:
      'Recurso adicional com uma taxa fixa de ${{price, number}} por mês. O preço não é afetado pelo número de funções globais.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Se fizer quaisquer alterações durante o ciclo de faturamento atual, sua próxima fatura pode ser ligeiramente mais alta no primeiro mês após a mudança. Será o preço base de ${{price, number}} mais os custos adicionais para o uso não faturado do ciclo atual e a cobrança total para o próximo ciclo. <a>Saiba mais</a>',
  },
};

export default Object.freeze(usage);
