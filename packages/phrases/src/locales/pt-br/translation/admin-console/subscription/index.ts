import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Plano Gratuito',
  free_plan_description:
    'Para projetos pessoais e avaliações iniciais do Logto. Sem cartão de crédito.',
  pro_plan: 'Plano Pro',
  pro_plan_description: 'Para empresas se beneficiarem tranquilo com o Logto.',
  enterprise: 'Empresa',
  /** UNTRANSLATED */
  enterprise_description:
    'For large-scale organizations requiring advanced features, full customization, and dedicated support to power mission-critical applications. Tailored to your needs for ultimate security, compliance, and performance.',
  /** UNTRANSLATED */
  admin_plan: 'Admin plan',
  /** UNTRANSLATED */
  dev_plan: 'Development plan',
  current_plan: 'Plano Atual',
  current_plan_description:
    'Aqui está o seu plano atual. Você pode facilmente ver o uso do seu plano, verificar a sua próxima fatura e fazer alterações no plano, conforme necessário.',
  plan_usage: 'Uso do plano',
  plan_cycle: 'Ciclo do plano: {{period}}. O uso é renovado em {{renewDate}}.',
  /** UNTRANSLATED */
  next_bill: 'Your upcoming bill',
  next_bill_hint: 'Para saber mais sobre o cálculo, consulte este <a>artigo</a>.',
  /** UNTRANSLATED */
  next_bill_tip:
    'The prices displayed here are tax-exclusive and may be subject to a slight delay in updates. The tax amount will be calculated based on the information you provide and your local regulatory requirements, and will be shown in your invoices.',
  manage_payment: 'Gerenciar pagamento',
  overfill_quota_warning:
    'Você atingiu o limite de cota. Para evitar problemas, faça upgrade do plano.',
  upgrade_pro: 'Upgrade Pro',
  update_payment: 'Atualizar pagamento',
  payment_error:
    'Detectado um problema de pagamento. Não é possível processar $ {{price, number}} para o ciclo anterior. Atualize o pagamento para evitar a suspensão do serviço Logto.',
  downgrade: 'Downgrade',
  current: 'Atual',
  upgrade: 'Atualizar',
  quota_table,
  billing_history: {
    invoice_column: 'Faturas',
    status_column: 'Status',
    amount_column: 'Valor',
    invoice_created_date_column: 'Data de criação da fatura',
    invoice_status: {
      void: 'Cancelada',
      paid: 'Paga',
      open: 'Em aberto',
      uncollectible: 'Vencida',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'Tem certeza de que deseja fazer downgrade?',
    description:
      'Se você escolher mudar para o <targetName/>, observe que você não terá mais acesso à cota e aos recursos que estavam anteriormente no <currentName/>.',
    before: 'Antes: <name/>',
    after: 'Depois: <name />',
    downgrade: 'Downgrade',
  },
  not_eligible_modal: {
    downgrade_title: 'Você não é elegível para fazer downgrade',
    downgrade_description:
      'Certifique-se de atender aos seguintes critérios antes de fazer o downgrade para o plano <name/>.',
    downgrade_help_tip: 'Precisa de ajuda com o downgrade? <a>Contate-nos</a>.',
    upgrade_title: 'Lembrete amigável para nossos honrados early adopters',
    upgrade_description:
      'Você está usando atualmente mais do que o permitido pelo <name />. O Logto agora é oficial, incluindo recursos adaptados a cada plano. Antes de considerar a atualização para o <name />, verifique se você atende aos seguintes critérios antes de fazer o upgrade.',
    upgrade_pro_tip: ' Ou considere fazer o upgrade para o Plano Pro.',
    upgrade_help_tip: 'Precisa de ajuda com o upgrade? <a>Contate-nos</a>.',
    a_maximum_of: 'Um máximo de <item/>',
  },
  upgrade_success: 'Atualizado com sucesso para <name/>',
  downgrade_success: 'Downgrade realizado com sucesso para <name/>',
  subscription_check_timeout:
    'A verificação de assinatura expirou. Por favor, atualize mais tarde.',
  no_subscription: 'Nenhuma assinatura',
};

export default Object.freeze(subscription);
