const usage = {
  status_active: 'W użyciu',
  status_inactive: 'Nie w użyciu',
  limited_status_quota_description: '(Pierwsze {{quota}} wliczone)',
  unlimited_status_quota_description: '(Wliczone)',
  disabled_status_quota_description: '(Nie wliczone)',
  usage_description_with_unlimited_quota: '{{usage}}<span> (Nielimitowany)</span>',
  usage_description_with_limited_quota: '{{usage}}<span> (Pierwsze {{basicQuota}} wliczone)</span>',
  usage_description_without_quota: '{{usage}}<span> (Nie wliczone)</span>',
  mau: {
    title: 'MAU',
    tooltip:
      'MAU to unikalny użytkownik, który wymienił co najmniej jeden token z Logto w ciągu cyklu rozliczeniowego. Nielimitowany w planie Pro. <a>Dowiedz się więcej</a>',
    tooltip_for_enterprise:
      'MAU to unikalny użytkownik, który wymienił co najmniej jeden token z Logto w ciągu cyklu rozliczeniowego. Nielimitowany w planie Enterprise.',
  },
  organizations: {
    title: 'Organizacje',
    tooltip:
      'Funkcja dodatkowa ze stałą ceną ${{price, number}} miesięcznie. Cena nie zależy od liczby organizacji ani poziomu ich aktywności.',
    description_for_enterprise: '(Wliczone)',
    tooltip_for_enterprise:
      'Wliczenie zależy od twojego planu. Jeśli funkcja organizacji nie jest w twoim początkowym kontrakcie, zostanie dodana do twojego rachunku po aktywacji. Dodatek kosztuje ${{price, number}}/miesiąc, niezależnie od liczby organizacji czy ich aktywności.',
    tooltip_for_enterprise_with_numbered_basic_quota:
      'Twój plan obejmuje pierwsze {{basicQuota}} organizacji za darmo. Jeśli potrzebujesz więcej, możesz je dodać z dodatkiem organizacyjnym za stawkę ${{price, number}} miesięcznie, niezależnie od liczby organizacji czy poziomu ich aktywności.',
  },
  mfa: {
    title: 'MFA',
    tooltip:
      'Funkcja dodatkowa ze stałą ceną ${{price, number}} miesięcznie. Cena nie zależy od liczby użytych czynników uwierzytelniania.',
    tooltip_for_enterprise:
      'Wliczenie zależy od twojego planu. Jeśli funkcja MFA nie jest w twoim początkowym kontrakcie, zostanie dodana do twojego rachunku po aktywacji. Dodatek kosztuje ${{price, number}}/miesiąc, niezależnie od liczby użytych czynników uwierzytelniania.',
  },
  enterprise_sso: {
    title: 'Enterprise SSO',
    tooltip: 'Funkcja dodatkowa w cenie ${{price, number}} za połączenie SSO miesięcznie.',
    tooltip_for_enterprise:
      'Dodatek funkcjonalny w cenie ${{price, number}} za połączenie SSO miesięcznie. Pierwsze {{basicQuota}} SSO są wliczone i darmowe w twoim kontrakcie.',
  },
  api_resources: {
    title: 'Zasoby API',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za zasób miesięcznie. Pierwsze 3 zasoby API są darmowe.',
    tooltip_for_enterprise:
      'Pierwsze {{basicQuota}} zasoby API są wliczone i darmowe w twoim kontrakcie. Jeśli potrzebujesz więcej, ${{price, number}} za zasób API miesięcznie.',
  },
  machine_to_machine: {
    title: 'Machine-to-machine',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za aplikację miesięcznie. Pierwsza aplikacja machine-to-machine jest darmowa.',
    tooltip_for_enterprise:
      'Pierwsza aplikacja machine-to-machine jest darmowa w twoim kontrakcie. Jeśli potrzebujesz więcej, ${{price, number}} za aplikację miesięcznie.',
  },
  tenant_members: {
    title: 'Członkowie dzierżawcy',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za członka miesięcznie. Pierwszy {{count}} członek dzierżawcy jest darmowy.',
    tooltip_one:
      'Funkcja dodatkowa w cenie ${{price, number}} za członka miesięcznie. Pierwszy {{count}} członek dzierżawcy jest darmowy.',
    tooltip_other:
      'Funkcja dodatkowa w cenie ${{price, number}} za członka miesięcznie. Pierwsze {{count}} członków dzierżawcy jest darmowych.',
    tooltip_for_enterprise:
      'Pierwszych {{basicQuota}} członków dzierżawcy jest wliczonych i darmowych w twoim kontrakcie. Jeśli potrzebujesz więcej, ${{price, number}} za członka dzierżawcy miesięcznie.',
  },
  tokens: {
    title: 'Tokeny',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za {{tokenLimit}} tokenów. Pierwszy {{basicQuota}} tokenów jest wliczony.',
    tooltip_for_enterprise:
      'Pierwszy {{basicQuota}} tokenów jest wliczony i darmowy w twoim kontrakcie. Jeśli potrzebujesz więcej, ${{price, number}} za {{tokenLimit}} tokenów miesięcznie.',
  },
  hooks: {
    title: 'Haki',
    tooltip:
      'Funkcja dodatkowa w cenie ${{price, number}} za hak. Pierwsze 10 haków jest wliczonych.',
    tooltip_for_enterprise:
      'Pierwsze {{basicQuota}} haki są wliczone i darmowe w twoim kontrakcie. Jeśli potrzebujesz więcej, ${{price, number}} za hak miesięcznie.',
  },
  security_features: {
    title: 'Zaawansowane zabezpieczenia',
    tooltip:
      'Funkcja dodatkowa z ceną ${{price, number}}/miesiąc za pełny pakiet zaawansowanych zabezpieczeń, w tym CAPTCHA, blokada identyfikatora, blokada adresu e-mail i inne.',
  },
  saml_applications: {
    title: 'Aplikacja SAML',
    tooltip: 'Funkcja dodatkowa w cenie ${{price, number}} za aplikację SAML miesięcznie.',
  },
  third_party_applications: {
    title: 'Aplikacja zewnętrzna',
    tooltip: 'Funkcja dodatkowa w cenie ${{price, number}} za aplikację miesięcznie.',
  },
  rbacEnabled: {
    title: 'Role',
    tooltip:
      'Funkcja dodatkowa ze stałą ceną ${{price, number}} miesięcznie. Cena nie zależy od liczby globalnych ról.',
  },
  pricing: {
    add_on_changes_in_current_cycle_notice:
      'Jeśli dokonasz jakichkolwiek zmian w bieżącym cyklu rozliczeniowym, Twój następny rachunek może być nieco wyższy w pierwszym miesiącu po zmianie. Będzie to cena bazowa ${{price, number}} plus koszty funkcji dodatkowych za nierozliczone użycie z bieżącego cyklu i pełne opłaty za kolejny cykl. <a>Dowiedz się więcej</a>',
  },
};

export default Object.freeze(usage);
