import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Plano Gratuito',
  free_plan_description:
    'Para projetos secundários e testes iniciais do Logto. Sem cartão de crédito.',
  hobby_plan: 'Plano Hobby',
  hobby_plan_description: 'Para desenvolvedores individuais ou ambientes de desenvolvimento.',
  pro_plan: 'Plano Pro',
  pro_plan_description: 'Para empresas que desejam se beneficiar sem preocupações com o Logto.',
  enterprise: 'Empresa',
  current_plan: 'Plano Atual',
  current_plan_description:
    'Este é o seu plano atual. Você pode visualizar o uso do plano, sua próxima fatura e atualizar para um plano de nível superior, se desejar.',
  plan_usage: 'Uso do plano',
  plan_cycle: 'Ciclo do plano: {{period}}. O uso é renovado em {{renewDate}}.',
  next_bill: 'Sua próxima fatura',
  next_bill_hint: 'Para saber mais sobre o cálculo, consulte este <a>artigo</a>.',
  next_bill_tip:
    'Sua próxima fatura inclui o preço base do seu plano para o próximo mês, bem como o custo do uso multiplicado pelo preço da unidade MAU em vários níveis.',
  manage_payment: 'Gerenciar pagamento',
  overfill_quota_warning:
    'Você atingiu o limite da sua cota. Para evitar problemas, faça upgrade do plano.',
  upgrade_pro: 'Atualizar para Pro',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Problema de pagamento detectado. Não é possível processar ${{price, number}} para o ciclo anterior. Atualize o pagamento para evitar a suspensão do serviço Logto.',
  downgrade: 'Downgrade',
  current: 'Atual',
  buy_now: 'Comprar agora',
  contact_us: 'Contate-nos',
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
    not_eligible: 'Você não é elegível para fazer o downgrade',
    not_eligible_description:
      'Verifique se você atende aos seguintes critérios antes de fazer o downgrade para o <name/>.',
    a_maximum_of: 'No máximo <item/>',
    help_tip: 'Precisa de ajuda para fazer o downgrade? <a>Entre em contato conosco</a>.',
  },
  upgrade_success: 'Atualizou com sucesso para <name/>',
  downgrade_success: 'Downgrade concluído com sucesso para <name/>',
  subscription_check_timeout:
    'A verificação de subscrição expirou. Por favor, atualize mais tarde.',
};

export default subscription;
