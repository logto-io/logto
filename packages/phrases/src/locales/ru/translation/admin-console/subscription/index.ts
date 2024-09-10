import quota_item from './quota-item.js';
import quota_table from './quota-table.js';

const subscription = {
  free_plan: 'Бесплатный план',
  free_plan_description: 'Для побочных проектов и начальных испытаний Logto. Без кредитной карты.',
  pro_plan: 'Про план',
  pro_plan_description: 'Позволяет бизнесу использовать Logto без забот.',
  enterprise: 'Enterprise',
  /** UNTRANSLATED */
  enterprise_description:
    'For large-scale organizations requiring advanced features, full customization, and dedicated support to power mission-critical applications. Tailored to your needs for ultimate security, compliance, and performance.',
  /** UNTRANSLATED */
  admin_plan: 'Admin plan',
  /** UNTRANSLATED */
  dev_plan: 'Development plan',
  current_plan: 'Текущий план',
  current_plan_description:
    'Вот ваш текущий тарифный план. Вы можете легко просмотреть использование вашего тарифа, проверить предстоящий счет и вносить изменения в тариф по мере необходимости.',
  plan_usage: 'Использование плана',
  plan_cycle: 'Цикл плана: {{period}}. Использование обновляется {{renewDate}}.',
  /** UNTRANSLATED */
  next_bill: 'Your upcoming bill',
  next_bill_hint: 'Чтобы узнать больше о расчете, ознакомьтесь с этой <a>статьей</a>.',
  /** UNTRANSLATED */
  next_bill_tip:
    'The prices displayed here are tax-exclusive and may be subject to a slight delay in updates. The tax amount will be calculated based on the information you provide and your local regulatory requirements, and will be shown in your invoices.',
  manage_payment: 'Управление платежами',
  overfill_quota_warning:
    'Вы достигли лимита вашего квоты. Чтобы избежать возможных проблем, повысьте план.',
  upgrade_pro: 'Повысить уровень до Pro',
  update_payment: 'Обновить платеж',
  payment_error:
    'Обнаружена ошибка платежа. Невозможно обработать сумму ${{price, number}} за предыдущий цикл. Обновите платежную информацию, чтобы избежать блокировки сервиса Logto.',
  downgrade: 'Понизить уровень',
  current: 'Текущий',
  upgrade: 'Обновить',
  quota_table,
  billing_history: {
    invoice_column: 'Счета',
    status_column: 'Статус',
    amount_column: 'Сумма',
    invoice_created_date_column: 'Дата создания счета',
    invoice_status: {
      void: 'Отменено',
      paid: 'Оплачено',
      open: 'Открыто',
      uncollectible: 'Просрочено',
    },
  },
  quota_item,
  downgrade_modal: {
    title: 'Вы действительно хотите понизить уровень?',
    description:
      'Если вы выберете переключиться на <targetName/>, обратите внимание, что у вас больше не будет доступа к квотам и функциям, которые были ранее в <currentName/>.',
    before: 'Позднее: <name/>',
    after: 'После: <name />',
    downgrade: 'Понизить уровень',
  },
  not_eligible_modal: {
    downgrade_title: 'Вы не можете понизить уровень тарифа',
    downgrade_description:
      'Перед понижением до тарифа <name/>, убедитесь, что соответствуете следующим критериям.',
    downgrade_help_tip: 'Нужна помощь в понижении? <a>Свяжитесь с нами</a>.',
    upgrade_title: 'Дружественное напоминание нашим уважаемым ранним пользователям',
    upgrade_description:
      'В данный момент вы используете больше, чем позволяет <name />. Logto теперь официально, включая функции, специально разработанные для каждого тарифного плана. Прежде чем рассматривать обновление до <name />, убедитесь, что вы соответствуете следующим критериям перед обновлением.',
    upgrade_pro_tip: ' Или рассмотрите обновление до Про-плана.',
    upgrade_help_tip: 'Нужна помощь в повышении? <a>Свяжитесь с нами</a>.',
    a_maximum_of: 'Максимум <item/>',
  },
  upgrade_success: 'Успешно повышен до <name/>',
  downgrade_success: 'Успешно понижен до <name/>',
  subscription_check_timeout: 'Время проверки подписки истекло. Пожалуйста, обновите позже.',
  no_subscription: 'Нет подписки',
};

export default Object.freeze(subscription);
