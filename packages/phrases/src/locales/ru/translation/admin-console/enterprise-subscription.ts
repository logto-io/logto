const enterprise_subscription = {
  page_title: 'Подписка',
  title: 'Управляйте своей подпиской',
  subtitle: 'Это управление вашей многопользовательской подпиской и историей платежей',
  tab: {
    subscription: 'Подписка',
    billing_history: 'История платежей',
  },
  subscription: {
    title: 'Подписка',
    description:
      'Легко отслеживайте использование, смотрите свой следующий счет и просматривайте свой оригинальный контракт.',
    enterprise_plan_title: 'Корпоративный план',
    enterprise_plan_description:
      'Это ваша подписка на корпоративный план, и эта квота распределяется между арендаторами. Обновление использования может быть немного задержано. ',
    add_on_title: 'Дополнения с поминутной оплатой',
    add_on_description:
      'Это дополнительные дополнения с оплатой по мере использования на основе вашего контракта или стандартных ставок Logto. Вы будете платить в соответствии с вашим фактическим использованием.',
    included: 'Включено',
    over_quota: 'Перерасход',
    basic_plan_column_title: {
      product: 'Продукт',
      usage: 'Использование',
      quota: 'Квота',
    },
    add_on_column_title: {
      product: 'Продукт',
      unit_price: 'Цена за единицу',
      quantity: 'Количество',
      total_price: 'Итоговая сумма',
    },
    add_on_sku_price: '${{price}}/месяц',
    private_region_title: 'Частный облачный экземпляр ({{regionName}})',
    shared_cross_tenants: 'Между арендаторами',
  },
};

export default Object.freeze(enterprise_subscription);
