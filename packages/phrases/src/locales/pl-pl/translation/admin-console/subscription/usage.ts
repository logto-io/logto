const usage = {
  /** UNTRANSLATED */
  status_active: 'In use',
  /** UNTRANSLATED */
  status_inactive: 'Not in use',
  mau: {
    title: 'MAU',
    description: '{{usage}}',
    tooltip:
      'MAU to unikalny użytkownik, który wymienił co najmniej jeden token z Logto w ciągu cyklu rozliczeniowego. Nielimitowany w planie Pro. <a>Dowiedz się więcej</a>',
  },
  organizations: {
    title: 'Organizacje',
    description: '{{usage}}',
    tooltip:
      'Funkcja dodatkowa ze stałą ceną ${{price, number}} miesięcznie. Cena nie zależy od liczby organizacji ani poziomu ich aktywności.',
  },
  mfa: {
    title: 'MFA',
    description: '{{usage}}',
    tooltip:
      'Funkcja dodatkowa ze stałą ceną ${{price, number}} miesięcznie. Cena nie zależy od liczby użytych czynników uwierzytelniania.',
  },
  enterprise_sso: {
    title: 'Enterprise SSO',
    description: '{{usage}}',
    tooltip: 'Funkcja dodatkowa w cenie ${{price, number}} za połączenie SSO miesięcznie.',
  },
  api_resources: {
    title: 'Zasoby API',
    description: '{{usage}} <span>(Bezpłatne dla pierwszych 3)</span>',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za zasób miesięcznie. Pierwsze 3 zasoby API są darmowe.',
  },
  machine_to_machine: {
    title: 'Machine-to-machine',
    description: '{{usage}} <span>(Bezpłatne dla pierwszego 1)</span>',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za aplikację miesięcznie. Pierwsza aplikacja machine-to-machine jest darmowa.',
  },
  tenant_members: {
    title: 'Członkowie dzierżawcy',
    description: '{{usage}} <span>(Bezpłatne dla pierwszych 3)</span>',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za członka miesięcznie. Pierwszych 3 członków dzierżawcy jest darmowych.',
  },
  tokens: {
    title: 'Tokeny',
    description: '{{usage}}',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za milion tokenów. Pierwszy 1 milion tokenów jest wliczony.',
  },
  hooks: {
    title: 'Haki',
    description: '{{usage}} <span>(Bezpłatne dla pierwszych 10)</span>',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za hak. Pierwsze 10 haków jest wliczonych.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Jeśli dokonasz jakichkolwiek zmian w bieżącym cyklu rozliczeniowym, Twój następny rachunek może być nieco wyższy w pierwszym miesiącu po zmianie. Będzie to cena bazowa ${{price, number}} plus koszty funkcji dodatkowych za nierozliczone użycie z bieżącego cyklu i pełne opłaty za kolejny cykl. <a>Dowiedz się więcej</a>',
  },
};

export default Object.freeze(usage);
