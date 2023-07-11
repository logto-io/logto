import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Бесплатный план',
  free_plan_description: 'Для побочных проектов и начальных испытаний Logto. Без кредитной карты.',
  hobby_plan: 'Хобби план',
  hobby_plan_description: 'Для отдельных разработчиков или сред разработки.',
  pro_plan: 'Про план',
  pro_plan_description: 'Позволяет бизнесу использовать Logto без забот.',
  enterprise: 'Enterprise',
  current_plan: 'Текущий план',
  current_plan_description:
    'Это ваш текущий план. Вы можете просмотреть использование плана, следующий счет и перейти на план более высокого уровня, если хотите.',
  plan_usage: 'Использование плана',
  plan_cycle: 'Цикл плана: {{period}}. Использование обновляется {{renewDate}}.',
  next_bill: 'Ваш следующий счет',
  next_bill_hint: 'Чтобы узнать больше о расчете, ознакомьтесь с этой <a>статьей</a>.',
  next_bill_tip:
    'Ваш будущий счет включает основную стоимость вашего плана на следующий месяц, а также стоимость вашего использования, умноженную на цену за единицу MAU в различных уровнях.',
  manage_payment: 'Управление платежами',
  overfill_quota_warning:
    'Вы достигли лимита вашего квоты. Чтобы избежать возможных проблем, повысьте план.',
  upgrade_pro: 'Повысить уровень до Pro',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Обнаружена ошибка платежа. Невозможно обработать сумму ${{price, number}} за предыдущий цикл. Обновите платежную информацию, чтобы избежать блокировки сервиса Logto.',
  downgrade: 'Понизить уровень',
  current: 'Текущий',
  buy_now: 'Купить сейчас',
  contact_us: 'Свяжитесь с нами',
  quota_table,
  billing_history: {
    invoice_column: 'Счета',
    status_column: 'Статус',
    amount_column: 'Сумма',
    invoice_created_date_column: 'Дата создания счета',
  },

  quota_item,

  downgrade_modal: {
    title: 'Вы действительно хотите понизить уровень?',
    description:
      'Если вы выберете переключиться на <targetName/>, обратите внимание, что у вас больше не будет доступа к квотам и функциям, которые были ранее в <currentName/>.',
    before: 'Позднее: <name/>',
    after: 'После: <name />',
    downgrade: 'Понизить уровень',
    not_eligible: 'Вы не имеете права на понижение уровня',
    not_eligible_description:
      'Убедитесь, что вы соответствуете следующим критериям, прежде чем понизить до <name/>.',
    a_maximum_of: 'Максимум <item/>',
  },
};

export default subscription;
