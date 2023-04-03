const role_details = {
  back_to_roles: 'Powrót do ról',
  identifier: 'Identyfikator',
  delete_description:
    'Usunięcie tej roli usunie uprawnienia z nią związanymi od użytkowników i usunie odwzorowanie między rolami, użytkownikami i uprawnieniami.',
  role_deleted: '{{name}} został pomyślnie usunięty!',
  settings_tab: 'Ustawienia',
  users_tab: 'Użytkownicy',
  permissions_tab: 'Uprawnienia',
  settings: 'Ustawienia',
  settings_description:
    'Role to grupowanie uprawnień, które mogą być przypisywane do użytkowników. Zapewniają również sposób agregacji uprawnień zdefiniowanych dla różnych interfejsów API, co umożliwia bardziej efektywne dodawanie, usuwanie lub modyfikowanie uprawnień w porównaniu z przypisywaniem ich do użytkowników indywidualnie.',
  field_name: 'Nazwa',
  field_description: 'Opis',
  permission: {
    assign_button: 'Przypisz uprawnienia',
    assign_title: 'Przypisz uprawnienia',
    assign_subtitle:
      'Przypisz uprawnienia do tej roli. Rola zyska dodane uprawnienia, a użytkownicy z tą rolą odziedziczą te uprawnienia.',
    assign_form_field: 'Przypisz uprawnienia',
    added_text_one: '{{count, number}} uprawnienie dodane',
    added_text_other: '{{count, number}} uprawnień dodanych',
    api_permission_count_one: '{{count, number}} uprawnienie',
    api_permission_count_other: '{{count, number}} uprawnień',
    confirm_assign: 'Przypisz uprawnienia',
    permission_assigned: 'Wybrane uprawnienia zostały pomyślnie przypisane do tej roli',
    deletion_description:
      'Jeśli to uprawnienie zostanie usunięte, dotknięty użytkownik z tą rolą straci dostęp przyznany przez to uprawnienie.',
    permission_deleted: 'Uprawnienie "{{name}}" zostało pomyślnie usunięte z tej roli',
    empty: 'Brak dostępnych uprawnień',
  },
  users: {
    assign_button: 'Przydziel użytkowników',
    name_column: 'Użytkownik',
    app_column: 'Aplikacja',
    latest_sign_in_column: 'Ostatnie logowanie',
    delete_description:
      'Osoba pozostanie w bazie użytkowników, ale straci autoryzację dla tej roli.',
    deleted: '{{name}} został pomyślnie usunięty z tej roli',
    assign_title: 'Przydziel użytkowników',
    assign_subtitle:
      'Przydziel użytkowników do tej roli. Znajdź odpowiednich użytkowników, wyszukując po nazwie, adresie e-mail, numerze telefonu lub identyfikatorze użytkownika.',
    assign_users_field: 'Przydziel użytkowników',
    confirm_assign: 'Przydziel użytkowników',
    users_assigned: 'Wybrani użytkownicy zostali pomyślnie przypisani do tej roli',
    empty: 'Brak dostępnych użytkowników',
  },
};

export default role_details;
