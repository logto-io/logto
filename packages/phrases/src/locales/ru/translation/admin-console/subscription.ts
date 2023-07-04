const subscription = {
  free_plan: 'Бесплатный план',
  free_plan_description: 'Для побочных проектов и начальных испытаний Logto. Без кредитной карты.',
  hobby_plan: 'Хобби план',
  hobby_plan_description: 'Для индивидуальных разработчиков или сред разработки.',
  pro_plan: 'Про план',
  pro_plan_description: 'Для предприятий, получающих выгоду от использования Logto без забот.',
  enterprise: 'Предприятие',
  current_plan: 'Текущий план',
  current_plan_description:
    'Это ваш текущий план. Вы можете просмотреть использование плана, ваш счет на следующий месяц и повысить его до плана более высокого уровня.',
  plan_usage: 'Использование плана',
  plan_cycle: 'Цикл плана: {{журнал}}. Использование обновляется {{дата обновления}}.',
  next_bill: 'Ваш следующий счет',
  next_bill_hint: 'Чтобы узнать больше о расчете, пожалуйста, прочтите эту <a>статью</a>.',
  next_bill_tip:
    'Ваш предстоящий счет включает базовую цену вашего плана на следующий месяц, а также стоимость вашего использования, умноженную на цену за единицу MAU в различных уровнях.',
  manage_payment: 'Управление платежами',
  overfill_quota_warning: 'Вы достигли лимита своей квоты. Чтобы избежать проблем, повысьте план.',
  upgrade_pro: 'Перейти на Pro',
  payment_error:
    // eslint-disable-next-line no-template-curly-in-string
    'Обнаружена проблема с платежом. Невозможно осуществить снятие денег в размере ${{price, number}} за предыдущий цикл. Обновите платежную информацию, чтобы избежать приостановки услуги Logto.',
  downgrade: 'Перейти на более низкую версию',
  current: 'Текущий',
  buy_now: 'Купить сейчас',
  contact_us: 'Свяжитесь с нами',
  quota_table: {
    quota: {
      title: 'Квота',
      tenant_limit: 'Лимит арендатора',
      base_price: 'Базовая цена',
      mau_unit_price: '* Цена за единицу MAU',
      mau_limit: 'Лимит MAU',
    },
    application: {
      title: 'Приложения',
      total: 'Общее количество',
      m2m: 'Машина с машиной',
    },
    resource: {
      title: 'API ресурсы',
      resource_count: 'Количество ресурсов',
      scopes_per_resource: 'Права для каждого ресурса',
    },
    branding: {
      title: 'Брендинг',
      custom_domain: 'Настроенный домен',
    },
    user_authn: {
      title: 'Проверка подлинности пользователя',
      omni_sign_in: 'Вход в систему Omni',
      built_in_email_connector: 'Встроенный почтовый коннектор',
      social_connectors: 'Социальные коннекторы',
      standard_connectors: 'Стандартные коннекторы',
    },
    roles: {
      title: 'Роли',
      roles: 'Роли',
      scopes_per_role: 'Права для каждой роли',
    },
    audit_logs: {
      title: 'Журналы аудита',
      retention: 'Сохранение',
    },
    hooks: {
      title: 'Hooks',
      amount: 'Количество',
    },
    support: {
      title: 'Поддержка',
      community: 'Сообщество',
      customer_ticket: 'Техническая поддержка',
      premium: 'Премиум',
    },
    mau_unit_price_footnote:
      '* Наши цены за единицу могут варьироваться в зависимости от фактических ресурсов, потребляемых в процессе использования, и Logto оставляет за собой право объяснить любые изменения в единичных ценах.',
    unlimited: 'Без ограничений',
    contact: 'Контакт',
    // eslint-disable-next-line no-template-curly-in-string
    monthly_price: '${{величина, number}}/мес',
    // eslint-disable-next-line no-template-curly-in-string
    mau_price: '${{величина, number}}/MAU',
    days_one: '{{количество, number}} день',
    days_other: '{{количество, number}} дней',
    add_on: 'Дополнительно',
  },
  downgrade_form: {
    allowed_title: 'Вы уверены, что хотите перейти на более низкую версию?',
    allowed_description:
      'Переходя на {{план}}, вы больше не получите доступ к следующим преимуществам.',
    not_allowed_title: 'Вы не можете перейти на более низкую версию',
    not_allowed_description:
      'Убедитесь, что вы соответствуете следующим стандартам, прежде чем переходить на {{план}}. Как только вы исправите и выполните требования, вы сможете перейти на более низкую версию.',
    confirm_downgrade: 'Все равно перейти на более низкую версию',
  },
};

export default subscription;
