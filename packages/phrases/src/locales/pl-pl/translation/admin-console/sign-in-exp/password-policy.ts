const password_policy = {
  password_requirements: 'Wymagania dotyczące hasła',
  minimum_length: 'Minimalna długość',
  minimum_length_description:
    'NIST sugeruje użycie <a>co najmniej 8 znaków</a> dla produktów internetowych.',
  minimum_length_error: 'Minimalna długość musi wynosić od {{min}} do {{max}} (włącznie).',
  minimum_required_char_types: 'Minimalna liczba wymaganych typów znaków',
  minimum_required_char_types_description:
    'Typy znaków: wielkie litery (A-Z), małe litery (a-z), cyfry (0-9) i znaki specjalne ({{symbols}}).',
  password_rejection: 'Odrzucanie hasła',
  compromised_passwords: 'Odrzucaj skompromitowane hasła',
  breached_passwords: 'Odrzucaj naruszone hasła',
  breached_passwords_description:
    'Odrzucaj hasła, które wcześniej zostały znalezione w bazach naruszeń.',
  restricted_phrases: 'Ogranicz niskie zabezpieczenia',
  restricted_phrases_tooltip:
    'Twoje hasło powinno omijać te frazy, chyba że zestawisz je z 3 lub więcej dodatkowymi znakami.',
  repetitive_or_sequential_characters: 'Powtarzające się lub sekwencyjne znaki',
  repetitive_or_sequential_characters_description: 'Na przykład "AAAA", "1234" i "abcd".',
  user_information: 'Informacje użytkownika',
  user_information_description: 'Na przykład adres e-mail, numer telefonu, nazwa użytkownika itp.',
  custom_words: 'Niestandardowe słowa',
  custom_words_description: 'Słowa kontekstowe, niezależne od wielkości liter, jeden na linię.',
  custom_words_placeholder: 'Nazwa twojej usługi, nazwa firmy itp.',
};

export default Object.freeze(password_policy);
