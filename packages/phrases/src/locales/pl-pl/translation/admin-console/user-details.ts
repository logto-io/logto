const user_details = {
  page_title: 'Szczegóły użytkownika',
  back_to_users: 'Powrót do zarządzania użytkownikami',
  created_title: 'Ten użytkownik został pomyślnie utworzony',
  created_guide: 'Oto informacje, które pomogą użytkownikowi w procesie logowania.',
  created_email: 'Adres email:',
  created_phone: 'Numer telefonu:',
  created_username: 'Nazwa użytkownika:',
  created_password: 'Hasło:',
  menu_delete: 'Usuń',
  delete_description: 'Tej akcji nie można cofnąć. Usunie to użytkownika na stałe.',
  deleted: 'Użytkownik został pomyślnie usunięty',
  reset_password: {
    reset_password: 'Zresetuj hasło',
    title: 'Czy na pewno chcesz zresetować hasło?',
    content: 'Tej akcji nie można cofnąć. To zresetuje informacje o logowaniu użytkownika.',
    congratulations: 'Ten użytkownik został zresetowany',
    new_password: 'Nowe hasło:',
  },
  tab_settings: 'Ustawienia',
  tab_roles: 'Role',
  tab_logs: 'Logi użytkownika',
  /** UNTRANSLATED */
  tab_organizations: 'Organizations',
  /** UNTRANSLATED */
  authentication: 'Authentication',
  authentication_description:
    'Każdy użytkownik ma profil zawierający wszystkie informacje o użytkowniku. Składa się on z podstawowych danych, tożsamości społecznościowych i niestandardowych danych.',
  /** UNTRANSLATED */
  user_profile: 'User profile',
  field_email: 'Adres e-mail',
  field_phone: 'Numer telefonu',
  field_username: 'Nazwa użytkownika',
  field_name: 'Imię i nazwisko',
  field_avatar: 'Adres URL obrazka awatara',
  field_avatar_placeholder: 'https://twoja.domena/cdn/avatar.png',
  field_custom_data: 'Dane niestandardowe',
  field_custom_data_tip:
    'Dodatkowe informacje o użytkowniku niewymienione jako właściwości predefiniowane, takie jak preferowany przez użytkownika kolor i język.',
  field_connectors: 'Połączenia społecznościowe',
  /** UNTRANSLATED */
  field_sso_connectors: 'Enterprise connections',
  custom_data_invalid: 'Nieprawidłowe dane niestandardowe JSON',
  connectors: {
    connectors: 'Połączenia',
    user_id: 'Identyfikator użytkownika',
    remove: 'Usuń',
    /** UNTRANSLATED */
    connected: 'This user is connected with multiple social connectors.',
    not_connected: 'Użytkownik nie jest połączony z żadnym połączeniem społecznościowym',
    deletion_confirmation: 'Usuwasz istniejącą tożsamość <name/>. Czy na pewno chcesz to zrobić?',
  },
  sso_connectors: {
    /** UNTRANSLATED */
    connectors: 'Connectors',
    /** UNTRANSLATED */
    enterprise_id: 'Enterprise ID',
    /** UNTRANSLATED */
    connected:
      'This user is connected to multiple enterprise identity providers for Single Sign-On.',
    /** UNTRANSLATED */
    not_connected:
      'The user is not connected to any enterprise identity providers for Single Sign-On.',
  },
  mfa: {
    field_name: 'Wieloetapowa autoryzacja',
    field_description: 'Ten użytkownik włączył czynniki autoryzacji dwuetapowej.',
    name_column: 'Wieloetapowa autoryzacja',
    field_description_empty: 'Ten użytkownik nie włączył czynników uwierzytelniania dwuetapowego.',
    deletion_confirmation:
      'Usuwasz istniejący <name/> dla autentykatora dwuetapowego. Czy na pewno chcesz to zrobić?',
  },
  suspended: 'Zawieszony',
  suspend_user: 'Zawieś użytkownika',
  suspend_user_reminder:
    'Czy na pewno chcesz zawiesić tego użytkownika? Użytkownik nie będzie mógł się zalogować do Twojej aplikacji i nie będzie mógł uzyskać nowego tokena dostępu po wygaśnięciu obecnego. Ponadto, jakiekolwiek żądania API złożone przez tego użytkownika będą nieudane.',
  suspend_action: 'Zawieś',
  user_suspended: 'Użytkownik został zawieszony.',
  reactivate_user: 'Aktywuj użytkownika',
  reactivate_user_reminder:
    'Czy na pewno chcesz aktywować tego użytkownika? Umożliwi to wszystkie próby logowania dla tego użytkownika.',
  reactivate_action: 'Aktywuj',
  user_reactivated: 'Użytkownik został aktywowany.',
  roles: {
    name_column: 'Rola',
    description_column: 'Opis',
    assign_button: 'Przypisz role',
    delete_description:
      'Ta akcja usunie tę rolę z tego użytkownika. Rola nadal będzie istnieć, ale nie będzie już przypisana do tego użytkownika.',
    deleted: '{{name}} został usunięty z tego użytkownika.',
    assign_title: 'Przypisz role dla {{name}}',
    assign_subtitle: 'Autoryzuj {{name}} jedną lub wiele ról',
    assign_role_field: 'Przypisz role',
    role_search_placeholder: 'Szukaj po nazwie roli',
    added_text: '{{value, number}} dodanych',
    assigned_user_count: '{{value, number}} użytkowników',
    confirm_assign: 'Przypisz role',
    role_assigned: 'Pomyślnie przypisano rolę(y)',
    search: 'Szukaj po nazwie roli, opisie lub ID',
    empty: 'Brak dostępnej roli',
  },
  warning_no_sign_in_identifier:
    'Aby się zalogować, użytkownik musi mieć co najmniej jeden z identyfikatorów logowania (nazwa użytkownika, e-mail, numer telefonu lub konto społecznościowe). Czy na pewno chcesz kontynuować?',
  /** UNTRANSLATED */
  organization_roles_tooltip:
    'Organization roles assigned to the current user in this organization.',
};

export default Object.freeze(user_details);
