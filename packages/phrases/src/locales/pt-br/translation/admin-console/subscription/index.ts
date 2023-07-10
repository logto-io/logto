import quota_item_limited from './quota-item-limited.js';
import quota_item_unlimited from './quota-item-unlimited.js';
import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Plano Gratuito',
  free_plan_description:
    'Para projetos pessoais e avaliações iniciais do Logto. Sem cartão de crédito.',
  hobby_plan: 'Plano Hobby',
  hobby_plan_description: 'Para desenvolvedores individuais ou ambientes de desenvolvimento.',
  pro_plan: 'Plano Pro',
  pro_plan_description: 'Para empresas se beneficiarem tranquilo com o Logto.',
  enterprise: 'Empresa',
  current_plan: 'Plano Atual',
  current_plan_description:
    'Este é o seu plano atual. Você pode visualizar o uso do plano, sua próxima fatura e fazer upgrade para um plano de nível superior, se desejar.',
  plan_usage: 'Uso do plano',
  plan_cycle: 'Ciclo do plano: {{period}}. O uso é renovado em {{renewDate}}.',
  next_bill: 'Sua próxima fatura',
  next_bill_hint: 'Para saber mais sobre o cálculo, consulte este <a>artigo</a>.',
  next_bill_tip:
    'Sua próxima fatura inclui o preço base do seu plano para o próximo mês, além do custo do uso multiplicado pelo preço da unidade MAU em vários níveis.',
  manage_payment: 'Gerenciar pagamento',
  overfill_quota_warning:
    'Você atingiu o limite de cota. Para evitar problemas, faça upgrade do plano.',
  upgrade_pro: 'Upgrade Pro',
  payment_error:
    'Detectado um problema de pagamento. Não é possível processar $ {{price, número}} para o ciclo anterior. Atualize o pagamento para evitar a suspensão do serviço Logto.',
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
  },
  quota_item_limited,
  quota_item,
  quota_item_unlimited,
  downgrade_modal: {
    title: 'Tem certeza de que deseja fazer downgrade?',
    description:
      'Se você escolher mudar para o <targetName/>, observe que você não terá mais acesso à cota e aos recursos que estavam anteriormente no <currentName/>.',
    before: 'Antes: <name/>',
    after: 'Depois: <name />',
    downgrade: 'Downgrade',
    not_eligible: 'Não é elegível para downgrade',
    not_eligible_description:
      'Certifique-se de atender aos seguintes critérios antes de fazer downgrade para o <name/>.',
    a_maximum_of: 'Um máximo de <item/>',
  },
};

export default subscription;
