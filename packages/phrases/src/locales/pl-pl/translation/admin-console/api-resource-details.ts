const api_resource_details = {
  page_title: 'Szczegóły zasobów API',
  back_to_api_resources: 'Powróć do zasobów API',
  general_tab: 'Ogólne',
  permissions_tab: 'Uprawnienia',
  settings: 'Ustawienia',
  settings_description:
    'Zasoby API, tzw. wskaźniki zasobów, wskazują na usługi lub zasoby docelowe, które mają być żądane, zwykle w zmiennej formatu URI reprezentującej tożsamość zasobu.',
  management_api_settings_description:
    'Logto Management API to kompleksowa kolekcja interfejsów API, które umożliwiają administratorom zarządzanie szerokim zakresem zadań związanych z tożsamością, egzekwowanie polityk bezpieczeństwa oraz przestrzeganie przepisów i standardów.',
  management_api_notice:
    'To API reprezentuje jednostkę Logto i nie można go modyfikować ani usuwać. Możesz użyć API zarządzania do szerokiego zakresu zadań związanych z tożsamością. <a>Więcej informacji</a>',
  token_expiration_time_in_seconds: 'Czas wygaśnięcia tokenu (w sekundach)',
  token_expiration_time_in_seconds_placeholder: 'Wprowadź czas wygaśnięcia tokenu',
  delete_description:
    'Tej akcji nie można cofnąć. Spowoduje to trwałe usunięcie zasobu API. Wpisz nazwę zasobu API <span>{{name}}</span>, aby potwierdzić.',
  enter_your_api_resource_name: 'Wprowadź nazwę swojego zasobu API',
  api_resource_deleted: 'Zasób API {{name}} został pomyślnie usunięty',
  permission: {
    create_button: 'Utwórz uprawnienie',
    create_title: 'Utwórz uprawnienie',
    create_subtitle: 'Zdefiniuj uprawnienia (zakresy) wymagane przez to API.',
    confirm_create: 'Utwórz uprawnienie',
    edit_title: 'Edytuj uprawnienie',
    edit_subtitle: 'Zdefiniuj uprawnienia (zakresy) wymagane przez API {{resourceName}}.',
    name: 'Nazwa uprawnienia',
    name_placeholder: 'ready:resource',
    forbidden_space_in_name: 'Nazwa uprawnienia nie może zawierać spacji.',
    description: 'Opis',
    description_placeholder: 'Możliwość odczytu zasobów',
    permission_created: 'Uprawnienie {{name}} zostało pomyślnie utworzone',
    delete_description:
      'Jeśli to uprawnienie zostanie usunięte, użytkownik, który miał to uprawnienie, straci dostęp przyznany przez nie.',
    deleted: 'Uprawnienie "{{name}}" zostało pomyślnie usunięte.',
  },
};

export default Object.freeze(api_resource_details);
