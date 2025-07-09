import add_on from './add-on.js';
import featured_plan_content from './featured-plan-content.js';
import paywall from './paywall.js';

const upsell = {
  upgrade_plan: 'Повысить план',
  compare_plans: 'Сравнить планы',
  view_plans: 'Просмотреть планы',
  create_tenant: {
    title: 'Выберите план арендатора',
    description:
      'Logto предоставляет конкурентные варианты планов с инновационной и доступной ценой, специально разработанными для растущих компаний. <a>Узнать больше</a>',
    base_price: 'Базовая цена',
    monthly_price: '{{value, number}}/мес.',
    view_all_features: 'Просмотреть все функции',
    select_plan: 'Выбрать <name/>',
    free_tenants_limit: 'До {{count, number}} бесплатного арендатора',
    free_tenants_limit_other: 'До {{count, number}} бесплатных арендаторов',
    most_popular: 'Самый популярный',
    upgrade_success: 'Успешно повышен до <name/>',
  },
  mau_exceeded_modal: {
    title: 'Превышено количество активных пользователей (MAU). Повысьте свой план.',
    notification:
      'Текущее количество активных пользователей (MAU) превысило лимит в плане <planName/>. Пожалуйста, незамедлительно обновите свой план до премиум-версии, чтобы избежать приостановки сервиса Logto.',
    update_plan: 'Обновить план',
  },
  token_exceeded_modal: {
    title: 'Превышено использование токенов. Обновите свой план.',
    notification:
      'Вы превысили лимит использования токенов <planName/>. Пользователи не смогут должным образом получить доступ к сервису Logto. Пожалуйста, обновите свой план до премиум-версии, чтобы избежать каких-либо неудобств.',
  },
  payment_overdue_modal: {
    title: 'Просрочен платеж за счет',
    notification:
      'Упс! Оплата счета арендатора <span>{{name}}</span> не удалась. Пожалуйста, оплатите счет немедленно, чтобы избежать приостановки сервиса Logto.',
    unpaid_bills: 'Неоплаченные счета',
    update_payment: 'Обновить платеж',
  },
  add_on_quota_item: {
    api_resource: 'API-ресурс',
    machine_to_machine: 'приложение "машина-машина"',
    tokens: '{{limit}}M токенов',
    tenant_member: 'член арендатора',
  },
  charge_notification_for_quota_limit:
    'Вы превысили лимит вашей квоты по {{item}}. Logto начнет взимать плату за использование сверх вашей квоты. Начисление начнется в день выпуска нового дизайна цен на дополнение. <a>Узнать больше</a>',
  paywall,
  featured_plan_content,
  add_on,
  convert_to_production_modal: {
    title: 'Вы собираетесь изменить свой арендатор разработки на арендатор производства',
    description:
      'Готовы запустить в работу? Перевод этого dev-арендатора в арендатор производства разблокирует все функции',
    benefits: {
      stable_environment:
        'Для конечных пользователей: стабильная среда для реального использования.',
      keep_pro_features:
        'Сохраните функции Pro: Вы собираетесь подписаться на Pro план. <a>Просмотр функций Pro.</a>',
      no_dev_restrictions:
        'Нет ограничений для разработчиков: снимает лимиты системы сущностей и ресурсов и баннер входа в систему.',
    },
    cards: {
      dev_description: 'Для тестирования',
      prod_description: 'Реальная продукция',
      convert_label: 'преобразовать',
    },
    button: 'Конвертировать в производственный арендатор',
  },
};

export default Object.freeze(upsell);
