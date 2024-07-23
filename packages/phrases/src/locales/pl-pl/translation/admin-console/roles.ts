const roles = {
  page_title: 'Rola',
  title: 'Rola',
  subtitle:
    'Rola zawiera uprawnienia określające, co użytkownik może robić. RBAC wykorzystuje role do udostępniania użytkownikom zasobów do określonych działań.',
  create: 'Utwórz rolę',
  role_name: 'Nazwa roli',
  role_type: 'Typ roli',
  type_user: 'Użytkownik',
  type_machine_to_machine: 'Maszyna-do-maszyny',
  role_description: 'Opis',
  role_name_placeholder: 'Wprowadź nazwę swojej roli',
  role_description_placeholder: 'Wprowadź opis swojej roli',
  col_roles: 'Role',
  col_type: 'Typ',
  col_description: 'Opis',
  col_assigned_entities: 'Przypisane',
  user_counts: '{{count}} użytkownicy',
  application_counts: '{{count}} aplikacje',
  user_count: '{{count}} użytkownik',
  application_count: '{{count}} aplikacja',
  assign_permissions: 'Przypisz uprawnienia',
  create_role_title: 'Utwórz rolę',
  create_role_description:
    'Używaj ról do organizowania uprawnień i przypisywania ich użytkownikom.',
  create_role_button: 'Utwórz rolę',
  role_created: 'Rola {{name}} została pomyślnie utworzona.',
  search: 'Wyszukaj po nazwie roli, opisie lub identyfikatorze',
  placeholder_title: 'Role',
  placeholder_description:
    'Role są grupowaniem uprawnień, które mogą być przypisywane użytkownikom. Upewnij się, że najpierw dodasz uprawnienie, zanim utworzysz role.',
  assign_roles: 'Przypisz role',
  management_api_access_notification:
    'Aby uzyskać dostęp do interfejsu API zarządzania Logto, wybierz role z uprawnieniami do interfejsu API zarządzania <flag/>.',
  with_management_api_access_tip:
    'Ta rola maszyny do maszyny zawiera uprawnienia do interfejsu API zarządzania Logto',
  role_creation_hint: 'Nie możesz znaleźć odpowiedniej roli? <a>Utwórz rolę</a>',
};

export default Object.freeze(roles);
