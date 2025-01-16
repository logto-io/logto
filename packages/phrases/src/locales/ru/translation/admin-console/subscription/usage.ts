const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  /** UNTRANSLATED */
  limited_status_quota_description: '(First {{quota}} included)',
  /** UNTRANSLATED */
  unlimited_status_quota_description: '(Included)',
  /** UNTRANSLATED */
  disabled_status_quota_description: '(Not included)',
  /** UNTRANSLATED */
  usage_description_with_unlimited_quota: '{{usage}}<span> (Unlimited)</span>',
  /** UNTRANSLATED */
  usage_description_with_limited_quota: '{{usage}}<span> (First {{basicQuota}} included)</span>',
  /** UNTRANSLATED */
  usage_description_without_quota: '{{usage}}<span> (Not included)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU — это уникальный пользователь, который обменял хотя бы один токен с Logto в течение расчетного цикла. Безлимитно для Pro плана. <a>Узнать больше</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'Организации',
    tooltip:
      'Дополнительная функция с фиксированной ставкой ${{price, number}} в месяц. Цена не зависит от количества организаций или уровня их активности.',
    /** UNTRANSLATED */
    description_for_enterprise: '(Included)',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the organization feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of organizations or their activity.',
    /** UNTRANSLATED */
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Your plan includes the first {{basicQuota}} organizations for free. If you need more, you can add them with the organization add-on at a flat rate of ${{price, number}} per month, regardless of the number of organizations or their activity level.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Дополнительная функция с фиксированной ставкой ${{price, number}} в месяц. Цена не зависит от количества используемых факторов аутентификации.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'Корпоративное SSO',
    tooltip: 'Дополнительная функция с ценой ${{price, number}} за SSO соединение в месяц.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'API ресурсы',
    tooltip:
      'Дополнительная функция с ценой ${{price, number}} за ресурс в месяц. Первые 3 API ресурса предоставляются бесплатно.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'Machine-to-machine',
    tooltip:
      'Дополнительная функция с ценой ${{price, number}} за приложение в месяц. Первое machine-to-machine приложение предоставляется бесплатно.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'Члены арендатора',
    tooltip:
      'Дополнительная функция с ценой ${{price, number}} за участника в месяц. Первые 3 члена арендатора предоставляются бесплатно.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'Токены',
    tooltip:
      'Дополнительная функция с ценой ${{price, number}} за {{tokenLimit}} токенов. Первые 1 {{basicQuota}} токенов включены.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'Хуки',
    tooltip: 'Дополнительная функция с ценой ${{price, number}} за хук. Первые 10 хуков включены.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Если вы внесете изменения в течение текущего расчетного цикла, ваш следующий счет может слегка увеличиться за первый месяц после изменения. Это будет ${{price, number}} базовой цены плюс дополнительные расходы на неучтенные объемы использования из текущего цикла и полную плату за следующий цикл. <a>Узнать больше</a>',
  },
};

export default Object.freeze(usage);
