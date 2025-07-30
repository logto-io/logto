const user_identity_details = {
  social_identity_page_title: 'Szczegóły tożsamości społecznej',
  back_to_user_details: 'Powrót do szczegółów użytkownika',
  delete_identity: `Usuń połączenie tożsamości`,
  social_account: {
    title: 'Konto społecznościowe',
    description:
      'Wyświetl dane użytkownika i informacje o profilu zsynchronizowane z połączonym kontem {{connectorName}}.',
    provider_name: 'Nazwa dostawcy tożsamości społecznej',
    identity_id: 'ID tożsamości społecznej',
    user_profile: 'Profil użytkownika zsynchronizowany z dostawcą tożsamości społecznej',
  },
  sso_account: {
    title: 'Konto SSO przedsiębiorstwa',
    description:
      'Wyświetl dane użytkownika i informacje o profilu zsynchronizowane z połączonym kontem {{connectorName}}.',
    provider_name: 'Nazwa dostawcy tożsamości SSO przedsiębiorstwa',
    identity_id: 'ID tożsamości SSO przedsiębiorstwa',
    user_profile: 'Profil użytkownika zsynchronizowany z dostawcą tożsamości SSO przedsiębiorstwa',
  },
  token_storage: {
    title: 'Token dostępu',
    description:
      'Przechowuj tokeny dostępu i odświeżania z {{connectorName}} w tajnym repozytorium. Umożliwia automatyczne wywoływanie API bez wielokrotnego wyrażania zgody przez użytkownika.',
  },
  access_token: {
    title: 'Token dostępu',
    description_active:
      'Token dostępu jest aktywny i bezpiecznie przechowywany w tajnym repozytorium. Twój produkt może go używać do uzyskiwania dostępu do API {{connectorName}}.',
    description_inactive:
      'Ten token dostępu jest nieaktywny (np. cofnięty). Użytkownicy muszą ponownie autoryzować dostęp, aby przywrócić funkcjonalność.',
    description_expired:
      'Ten token dostępu wygasł. Odnowienie nastąpi automatycznie przy następnym żądaniu API za pomocą tokenu odświeżania. Jeśli token odświeżania nie jest dostępny, wymagana jest ponowna autoryzacja użytkownika.',
  },
  refresh_token: {
    available:
      'Token odświeżania jest dostępny. Jeśli token dostępu wygasnie, zostanie automatycznie odświeżony za pomocą tokenu odświeżania.',
    not_available:
      'Token odświeżania nie jest dostępny. Po wygaśnięciu tokenu dostępu użytkownicy muszą ponownie się uwierzytelnić, aby uzyskać nowe tokeny.',
  },
  token_status: 'Status tokenu',
  created_at: 'Utworzono',
  updated_at: 'Zaktualizowano',
  expires_at: 'Wygasa',
  scopes: 'Zakresy',
  delete_tokens: {
    title: 'Usuń tokeny',
    description:
      'Usuń przechowywane tokeny. Użytkownicy muszą ponownie autoryzować dostęp, aby przywrócić funkcjonalność.',
    confirmation_message:
      'Czy na pewno chcesz usunąć tokeny? Logto Secret Vault usunie przechowywane tokeny dostępu i odświeżające {{connectorName}}. Ten użytkownik musi ponownie autoryzować, aby przywrócić dostęp do API {{connectorName}}.',
  },
  token_storage_disabled: {
    title: 'Przechowywanie tokenów jest wyłączone dla tego łącznika',
    description:
      'Użytkownicy mogą obecnie korzystać z {{connectorName}} tylko do logowania, łączenia kont lub synchronizacji profili podczas każdego przepływu zgody. Aby uzyskać dostęp do API {{connectorName}} i wykonywać działania w imieniu użytkowników, proszę włączyć przechowywanie tokenów w',
  },
};

export default Object.freeze(user_identity_details);
