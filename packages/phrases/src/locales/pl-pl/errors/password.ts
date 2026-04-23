const password = {
  unsupported_encryption_method: 'Metoda szyfrowania {{name}} nie jest obsługiwana.',
  pepper_not_found: 'Nie znaleziono wartości pepper dla hasła. Sprawdź swoje zmienne środowiskowe.',
  rejected: 'Odrzucono hasło. Sprawdź, czy spełnia ono wymagania.',
  invalid_legacy_password_format: 'Nieprawidłowy format starego hasła.',
  unsupported_legacy_hash_algorithm: 'Nieobsługiwany stary algorytm haszowania: {{algorithm}}.',
  expired: 'Twoje hasło wygasło. Zresetuj hasło, aby kontynuować.',
};

export default Object.freeze(password);
