const password_policy = {
  password_requirements: 'Wymagania dotyczące hasła',
  minimum_length: 'Minimalna długość',
  /** UNTRANSLATED */
  minimum_length_description: 'NIST suggests using <a>at least 8 characters</a> for web products.',
  minimum_length_error: 'Minimalna długość musi wynosić od {{min}} do {{max}} (włącznie).',
  minimum_required_char_types: 'Minimalna liczba wymaganych typów znaków',
  /** UNTRANSLATED */
  minimum_required_char_types_description:
    'Character types: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special symbols ({{symbols}}).',
  password_rejection: 'Odrzucanie hasła',
  compromised_passwords: 'Odrzucaj skompromitowane hasła',
  breached_passwords: 'Odrzucaj naruszone hasła',
  breached_passwords_description:
    'Odrzucaj hasła, które wcześniej zostały znalezione w bazach naruszeń.',
  restricted_phrases: 'Ogranicz niskie zabezpieczenia',
  restricted_phrases_tooltip:
    'Użytkownicy nie mogą używać haseł, które są identyczne lub składają się z poniższych fraz. Do zwiększenia złożoności hasła dozwolone jest dodanie 3 lub więcej niekolejnych znaków.',
  repetitive_or_sequential_characters: 'Powtarzające się lub sekwencyjne znaki',
  repetitive_or_sequential_characters_description: 'Na przykład "AAAA", "1234" i "abcd".',
  user_information: 'Informacje użytkownika',
  user_information_description: 'Na przykład adres e-mail, numer telefonu, nazwa użytkownika itp.',
  custom_words: 'Niestandardowe słowa',
  custom_words_description: 'Słowa kontekstowe, niezależne od wielkości liter, jeden na linię.',
  custom_words_placeholder: 'Nazwa twojej usługi, nazwa firmy itp.',
};

export default Object.freeze(password_policy);
