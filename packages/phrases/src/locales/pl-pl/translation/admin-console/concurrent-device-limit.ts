const concurrent_device_limit = {
  title: 'Limit liczby jednoczesnych urządzeń',
  description:
    'Kontroluj, na ilu urządzeniach każdy użytkownik może być zalogowany w tej aplikacji.',
  enable: 'Włącz limit liczby jednoczesnych urządzeń',
  enable_description:
    'Po włączeniu Logto wymusza maksymalną liczbę aktywnych dostępów na użytkownika dla tej aplikacji.',
  field: 'Limit liczby jednoczesnych urządzeń dla aplikacji',
  field_description:
    'Ogranicz, na ilu urządzeniach użytkownik może być jednocześnie zalogowany. Logto wymusza to, ograniczając aktywne dostępy i automatycznie unieważnia najstarszy dostęp, gdy limit zostanie przekroczony.',
  field_placeholder: 'Pozostaw puste dla braku limitu',
  should_be_greater_than_zero: 'Powinno być większe niż 0.',
};

export default Object.freeze(concurrent_device_limit);
