const verification_record = {
  not_found: 'Nie znaleziono rekordu weryfikacyjnego.',
  permission_denied: 'Odmowa dostępu, proszę ponownie się uwierzytelnić.',
  not_supported_for_google_one_tap: 'Ta API nie obsługuje Google One Tap.',
  social_verification: {
    invalid_target:
      'Nieprawidłowy rekord weryfikacyjny. Oczekiwano {{expected}}, ale otrzymano {{actual}}.',
    token_response_not_found:
      'Nie znaleziono odpowiedzi tokena. Upewnij się, że przechowywanie tokenów jest obsługiwane i włączone dla łącznika społecznościowego.',
  },
};

export default Object.freeze(verification_record);
