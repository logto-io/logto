const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'MAU — это уникальный пользователь, который обменял хотя бы один токен с Logto в течение расчетного цикла. Безлимитно для Pro плана. <a>Узнать больше</a>',
  },
  organizations: {
    title: 'Организации',
    description: '{{usage}}',
    tooltip:
      'Дополнительная функция с фиксированной ставкой ${{price, number}} в месяц. Цена не зависит от количества организаций или уровня их активности.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'Дополнительная функция с фиксированной ставкой ${{price, number}} в месяц. Цена не зависит от количества используемых факторов аутентификации.',
  },
  enterprise_sso: {
    title: 'Корпоративное SSO',
    description: '{{usage}}',
    tooltip: 'Дополнительная функция с ценой ${{price, number}} за SSO соединение в месяц.',
  },
  api_resources: {
    title: 'API ресурсы',
    description: '{{usage}} <span>(Бесплатно для первых 3)</span>',
    tooltip:
      'Дополнительная функция с ценой ${{price, number}} за ресурс в месяц. Первые 3 API ресурса предоставляются бесплатно.',
  },
  machine_to_machine: {
    title: 'Machine-to-machine',
    description: '{{usage}} <span>(Бесплатно для первого 1)</span>',
    tooltip:
      'Дополнительная функция с ценой ${{price, number}} за приложение в месяц. Первое machine-to-machine приложение предоставляется бесплатно.',
  },
  tenant_members: {
    title: 'Члены арендатора',
    description: '{{usage}} <span>(Бесплатно для первых 3)</span>',
    tooltip:
      'Дополнительная функция с ценой ${{price, number}} за участника в месяц. Первые 3 члена арендатора предоставляются бесплатно.',
  },
  tokens: {
    title: 'Токены',
    description: '{{usage}}',
    tooltip:
      'Дополнительная функция с ценой ${{price, number}} за миллион токенов. Первые 1 миллион токенов включены.',
  },
  hooks: {
    title: 'Хуки',
    description: '{{usage}} <span>(Бесплатно для первых 10)</span>',
    tooltip: 'Дополнительная функция с ценой ${{price, number}} за хук. Первые 10 хуков включены.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Если вы внесете изменения в течение текущего расчетного цикла, ваш следующий счет может слегка увеличиться за первый месяц после изменения. Это будет ${{price, number}} базовой цены плюс дополнительные расходы на неучтенные объемы использования из текущего цикла и полную плату за следующий цикл. <a>Узнать больше</a>',
  },
};

export default Object.freeze(usage);
