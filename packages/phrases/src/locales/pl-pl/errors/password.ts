const password = {
  unsupported_encryption_method: 'Metoda szyfrowania {{name}} nie jest obsługiwana.',
  pepper_not_found: 'Nie znaleziono wartości pepper dla hasła. Sprawdź swoje zmienne środowiskowe.',
  rejected: 'Odrzucono hasło. Sprawdź, czy spełnia ono wymagania.',
  invalid_legacy_password_format: 'Nieprawidłowy format starego hasła.',
  unsupported_legacy_hash_algorithm: 'Nieobsługiwany stary algorytm haszowania: {{algorithm}}.',
};

export default Object.freeze(password);
