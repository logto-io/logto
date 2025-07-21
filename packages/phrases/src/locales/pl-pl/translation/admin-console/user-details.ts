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
    reset_title: 'Czy na pewno chcesz zresetować hasło?',
    generate_title: 'Czy na pewno chcesz wygenerować hasło?',
    content: 'Tej akcji nie można cofnąć. To zresetuje informacje o logowaniu użytkownika.',
    reset_complete: 'Ten użytkownik został zresetowany',
    generate_complete: 'Hasło zostało wygenerowane',
    new_password: 'Nowe hasło:',
    password: 'Hasło:',
  },
  tab_settings: 'Ustawienia',
  tab_roles: 'Role użytkowników',
  tab_logs: 'Logi użytkownika',
  tab_organizations: 'Organizacje',
  authentication: 'Autoryzacja',
  authentication_description:
    'Każdy użytkownik ma profil zawierający wszystkie informacje o użytkowniku. Składa się on z podstawowych danych, tożsamości społecznościowych i niestandardowych danych.',
  user_profile: 'Profil użytkownika',
  field_email: 'Adres e-mail',
  field_phone: 'Numer telefonu',
  field_username: 'Nazwa użytkownika',
  field_password: 'Hasło',
  field_name: 'Imię i nazwisko',
  field_avatar: 'Adres URL obrazka awatara',
  field_avatar_placeholder: 'https://twoja.domena/cdn/avatar.png',
  field_custom_data: 'Dane niestandardowe',
  field_custom_data_tip:
    'Dodatkowe informacje o użytkowniku niewymienione jako właściwości predefiniowane, takie jak preferowany przez użytkownika kolor i język.',
  field_profile: 'Profil',
  field_profile_tip:
    'Dodatkowe standardowe roszczenia OpenID Connect, które nie są uwzględnione we właściwościach użytkownika. Należy pamiętać, że wszystkie nieznane właściwości zostaną usunięte. Proszę zapoznać się z <a>referencją właściwości profilu</a> aby uzyskać więcej informacji.',
  field_connectors: 'Połączenia społecznościowe',
  field_sso_connectors: 'Połączenia przedsiębiorstwa',
  custom_data_invalid: 'Nieprawidłowe dane niestandardowe JSON',
  profile_invalid: 'Profil musi być poprawnym obiektem JSON',
  password_already_set: 'Hasło już ustawione',
  no_password_set: 'Brak ustawionego hasła',
  connectors: {
    connectors: 'Połączenia',
    user_id: 'Identyfikator użytkownika',
    remove: 'Usuń',
    connected: 'Ten użytkownik jest połączony z wieloma społecznymi konektorami.',
    not_connected: 'Użytkownik nie jest połączony z żadnym społecznym konektorem',
    deletion_confirmation: 'Usuwasz istniejącą tożsamość <name/>. Czy na pewno chcesz kontynuować?',
  },
  sso_connectors: {
    connectors: 'Konektory',
    enterprise_id: 'ID przedsiębiorstwa',
    connected:
      'Ten użytkownik jest połączony z kilkoma dostawcami tożsamości przedsiębiorstwa do jednokrotnego uwierzytelniania.',
    not_connected:
      'Użytkownik nie jest połączony z żadnym dostawcą tożsamości przedsiębiorstwa do jednokrotnego uwierzytelniania.',
  },
  mfa: {
    field_name: 'Wieloetapowa autoryzacja',
    field_description: 'Ten użytkownik włączył autoryzację dwuetapową.',
    name_column: 'Wieloetapowa autoryzacja',
    field_description_empty: 'Ten użytkownik nie włączył autoryzacji dwuetapowej.',
    deletion_confirmation:
      'Usuwasz istniejące <name/> w celu weryfikacji dwuetapowej. Czy na pewno chcesz kontynuować?',
  },
  suspended: 'Zawieszony',
  suspend_user: 'Zawieś użytkownika',
  suspend_user_reminder:
    'Czy na pewno chcesz zawiesić tego użytkownika? Użytkownik nie będzie mógł zalogować się do Twojej aplikacji i nie uzyska nowego tokena dostępu po wygaśnięciu obecnego. Ponadto jakiekolwiek żądania API złożone przez tego użytkownika będą nieudane.',
  suspend_action: 'Zawieś',
  user_suspended: 'Użytkownik został zawieszony.',
  reactivate_user: 'Aktywuj użytkownika',
  reactivate_user_reminder:
    'Czy na pewno chcesz aktywować tego użytkownika? Umożliwi to wszystkie próby logowania dla tego użytkownika.',
  reactivate_action: 'Aktywuj',
  user_reactivated: 'Użytkownik został aktywowany.',
  roles: {
    name_column: 'Rola użytkownika',
    description_column: 'Opis',
    assign_button: 'Przypisz role',
    delete_description:
      'Ta akcja usunie tę rolę z tego użytkownika. Rola nadal będzie istnieć, ale nie będzie już przypisana do tego użytkownika.',
    deleted: '{{name}} została usunięta z tego użytkownika.',
    assign_title: 'Przypisz role do {{name}}',
    assign_subtitle:
      'Znajdź odpowiednie role użytkowników, wyszukując według nazwy, opisu lub identyfikatora roli.',
    assign_role_field: 'Przypisz rolę',
    role_search_placeholder: 'Szukaj po nazwie roli',
    added_text: '{{value, number}} dodanych',
    assigned_user_count: '{{value, number}} użytkowników',
    confirm_assign: 'Przypisz role',
    role_assigned: 'Pomyślnie przypisano rolę(y)',
    search: 'Szukaj po nazwie roli, opisie lub ID',
    empty: 'Brak dostępnej roli',
  },
  warning_no_sign_in_identifier:
    'Aby się zalogować, użytkownik musi mieć co najmniej jeden identyfikator logowania (nazwa użytkownika, e-mail, numer telefonu lub konto społecznościowe). Czy na pewno chcesz kontynuować?',
  personal_access_tokens: {
    title: 'Token dostępu osobistego',
    title_other: 'Tokeny dostępu osobistego',
    title_short: 'token',
    empty: 'Użytkownik nie ma żadnych tokenów dostępu osobistego.',
    create: 'Utwórz nowy token',
    tip: 'Tokeny dostępu osobistego (PAT) zapewniają użytkownikom bezpieczny sposób przyznawania tokenów dostępu bez użycia poświadczeń i interaktywnego logowania. Jest to przydatne dla CI/CD, skryptów lub aplikacji, które muszą programowo uzyskiwać dostęp do zasobów.',
    value: 'Wartość',
    created_at: 'Utworzono w dniu',
    expires_at: 'Wygasa w dniu',
    never: 'Nigdy',
    create_new_token: 'Utwórz nowy token',
    delete_confirmation: 'Tej akcji nie można cofnąć. Czy na pewno chcesz usunąć ten token?',
    expired: 'Wygasły',
    expired_tooltip: 'Ten token wygasł w dniu {{date}}.',
    create_modal: {
      title: 'Utwórz token dostępu osobistego',
      expiration: 'Wygaśnięcie',
      expiration_description: 'Token wygaśnie w dniu {{date}}.',
      expiration_description_never:
        'Token nigdy nie wygaśnie. Zalecamy ustawienie daty wygaśnięcia w celu zwiększenia bezpieczeństwa.',
      days: '{{count}} dzień',
      days_other: '{{count}} dni',
      created: 'Token {{name}} został pomyślnie utworzony.',
    },
    edit_modal: {
      title: 'Edytuj token dostępu osobistego',
      edited: 'Token {{name}} został pomyślnie edytowany.',
    },
  },
  connections: {
    /** UNTRANSLATED */
    title: 'Connection',
    /** UNTRANSLATED */
    description:
      'The user links third-party accounts for social sign-in, enterprise SSO, or resources access.',
    /** UNTRANSLATED */
    token_status_column: 'Token status',
    token_status: {
      /** UNTRANSLATED */
      active: 'Active',
      /** UNTRANSLATED */
      expired: 'Expired',
      /** UNTRANSLATED */
      inactive: 'Inactive',
      /** UNTRANSLATED */
      not_applicable: 'Not applicable',
    },
  },
};

export default Object.freeze(user_details);
