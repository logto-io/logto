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
      'MAU to unikalny użytkownik, który wymienił co najmniej jeden token z Logto w ciągu cyklu rozliczeniowego. Nielimitowany w planie Pro. <a>Dowiedz się więcej</a>',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'A MAU is a unique user who has exchanged at least one token with Logto within a billing cycle. Unlimited for the Enterprise Plan.',
  },
  organizations: {
    title: 'Organizacje',
    tooltip:
      'Funkcja dodatkowa ze stałą ceną ${{price, number}} miesięcznie. Cena nie zależy od liczby organizacji ani poziomu ich aktywności.',
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
      'Funkcja dodatkowa ze stałą ceną ${{price, number}} miesięcznie. Cena nie zależy od liczby użytych czynników uwierzytelniania.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Inclusion depends on your plan. If the MFA feature isn’t in your initial contract, it will be added to your bill when you activate it. The add-on costs ${{price, number}}/month, regardless of the number of authentication factors used.',
  },
  enterprise_sso: {
    title: 'Enterprise SSO',
    tooltip: 'Funkcja dodatkowa w cenie ${{price, number}} za połączenie SSO miesięcznie.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'Add-on feature with a price of ${{price, number}} per SSO connection per month. The first {{basicQuota}} SSO are included and free to use in your contract-based plan.',
  },
  api_resources: {
    title: 'Zasoby API',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za zasób miesięcznie. Pierwsze 3 zasoby API są darmowe.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} API resources are included and free to use in your contract-based plan. If you need more, ${{price, number}} per API resource per month.',
  },
  machine_to_machine: {
    title: 'Machine-to-machine',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za aplikację miesięcznie. Pierwsza aplikacja machine-to-machine jest darmowa.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} machine-to-machine app is free to use in your contract-based plan. If you need more, ${{price, number}} per app per month.',
  },
  tenant_members: {
    title: 'Członkowie dzierżawcy',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za członka miesięcznie. Pierwszych 3 członków dzierżawcy jest darmowych.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tenant members are included and free to use in your contract-based plan. If you need more, ${{price, number}} per tenant member per month.',
  },
  tokens: {
    title: 'Tokeny',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za {{tokenLimit}} tokenów. Pierwszy {{basicQuota}} tokenów jest wliczony.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} tokens is included and free to use in your contract-based plan. If you need more, ${{price, number}} per {{tokenLimit}} tokens per month.',
  },
  hooks: {
    title: 'Haki',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za hak. Pierwsze 10 haków jest wliczonych.',
    /** UNTRANSLATED */
    tooltip_for_enterprise:
      'The first {{basicQuota}} hooks are included and free to use in your contract-based plan. If you need more, ${{price, number}} per hook per month.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Jeśli dokonasz jakichkolwiek zmian w bieżącym cyklu rozliczeniowym, Twój następny rachunek może być nieco wyższy w pierwszym miesiącu po zmianie. Będzie to cena bazowa ${{price, number}} plus koszty funkcji dodatkowych za nierozliczone użycie z bieżącego cyklu i pełne opłaty za kolejny cykl. <a>Dowiedz się więcej</a>',
  },
};

export default Object.freeze(usage);
