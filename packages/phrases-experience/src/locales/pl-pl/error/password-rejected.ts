const password_rejected = {
  too_short: 'Minimalna długość to {{min}}.',
  too_long: 'Maksymalna długość to {{max}}.',
  character_types: 'Wymagane są przynajmniej {{min}} rodzaje znaków.',
  unsupported_characters: 'Znaleziono niedozwolony znak.',
  pwned: 'Unikaj używania prostych haseł, które są łatwe do odgadnięcia.',
  restricted_found: 'Unikaj nadużywania {{list, list}}.',
  restricted_repetition: 'powtarzających się znaków',
  restricted_sequence: 'sekwencyjnych znaków',
  restricted_userinfo: 'twoich informacji osobistych',
  restricted_words: 'kontekstu produktu',
};

export default Object.freeze(password_rejected);
