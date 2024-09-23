import quota_item from './quota-item.js';
import quota_table from './quota-table.js';
import usage from './usage.js';

const subscription = {
  free_plan: 'Plano Gratuito',
  free_plan_description:
    'Para projetos secundários e testes iniciais do Logto. Sem cartão de crédito.',
  pro_plan: 'Plano Pro',
  pro_plan_description: 'Para empresas que desejam se beneficiar sem preocupações com o Logto.',
  enterprise: 'Plano Empresa',
  /** UNTRANSLATED */
  enterprise_description: 'For large teams and businesses with enterprise-grade requirements.',
  admin_plan: 'Plano de administrador',
  dev_plan: 'Plano de desenvolvimento',
  current_plan: 'Plano Atual',
  current_plan_description:
    'Aqui está o seu plano atual. Pode facilmente verificar a utilização do seu plano, verificar a sua próxima fatura e efetuar alterações no seu plano, conforme necessário.',
  plan_usage: 'Uso do plano',
  plan_cycle: 'Ciclo do plano: {{period}}. O uso é renovado em {{renewDate}}.',
  next_bill: 'A sua próxima fatura',
  next_bill_hint: 'Para saber mais sobre o cálculo, consulte este <a>artigo</a>.',
  next_bill_tip:
    'Os preços aqui exibidos não incluem impostos e podem estar sujeitos a um ligeiro atraso nas atualizações. O montante do imposto será calculado com base nas informações que fornecer e nos requisitos regulamentares locais, e será exibido nas suas faturas.',
  manage_payment: 'Gerenciar pagamento',
  overfill_quota_warning:
    'Você atingiu o limite da sua cota. Para evitar problemas, faça upgrade do plano.',
  upgrade_pro: 'Atualizar para Pro',
  update_payment: 'Atualizar pagamento',
  payment_error:
    'Problema de pagamento detectado. Não é possível processar ${{price, number}} para o ciclo anterior. Atualize o pagamento para evitar a suspensão do serviço Logto.',
  downgrade: 'Downgrade',
  current: 'Atual',
  upgrade: 'Atualização',
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
    title: 'Tem certeza de que deseja fazer o downgrade?',
    description:
      'Se você escolher mudar para o <targetName/>, observe que você não terá mais acesso à cota e às funcionalidades que estavam anteriormente no <currentName/>.',
    before: 'Antes: <name/>',
    after: 'Depois: <name />',
    downgrade: 'Downgrade',
  },
  not_eligible_modal: {
    downgrade_title: 'Não é possível fazer downgrade',
    downgrade_description:
      'Certifique-se de cumprir os seguintes critérios antes de efetuar o downgrade para o plano <name/>.',
    downgrade_help_tip: 'Precisa de ajuda com o downgrade? <a>Contacte-nos</a>.',
    upgrade_title: 'Lembrete amigável para os nossos honrados early adopters',
    upgrade_description:
      'Estás atualmente a utilizar mais do que o permitido pelo <name />. O Logto é agora oficial, incluindo funcionalidades adequadas a cada plano. Antes de considerares a atualização para o <name />, certifica-te de que preenches os seguintes critérios antes de proceder à atualização.',
    upgrade_pro_tip: ' Ou considera a atualização para o Plano Pro.',
    upgrade_help_tip: 'Precisa de ajuda com o upgrade? <a>Contacte-nos</a>.',
    a_maximum_of: 'Um máximo de <item/>',
  },
  upgrade_success: 'Atualizou com sucesso para <name/>',
  downgrade_success: 'Downgrade concluído com sucesso para <name/>',
  subscription_check_timeout:
    'A verificação de subscrição expirou. Por favor, atualize mais tarde.',
  no_subscription: 'Sem subscrição',
  usage,
};

export default Object.freeze(subscription);
