const custom_profile_fields = {
  table: {
    add_button: 'Dodaj pole profilu',
    title: {
      field_label: 'Etykieta pola',
      type: 'Typ',
      user_data_key: 'Klucz danych użytkownika',
    },
    placeholder: {
      title: 'Zbierz profil użytkownika',
      description:
        'Dostosuj pola, aby zbierać więcej informacji o profilu użytkownika podczas rejestracji.',
    },
  },
  type: {
    Text: 'Tekst',
    Number: 'Liczba',
    Date: 'Data',
    Checkbox: 'Checkbox (Wartość logiczna)',
    Select: 'Lista rozwijana (Pojedynczy wybór)',
    Url: 'URL',
    Regex: 'Wyrażenie regularne',
    Address: 'Adres (Kompozycja)',
    Fullname: 'Pełna nazwa (Kompozycja)',
  },
  modal: {
    title: 'Dodaj pole profilu',
    subtitle:
      'Dostosuj pola, aby zbierać więcej informacji o profilu użytkownika podczas rejestracji.',
    built_in_properties: 'Podstawowe dane użytkownika',
    custom_properties: 'Niestandardowe dane użytkownika',
    custom_data_field_name: 'Klucz danych użytkownika',
    custom_data_field_input_placeholder:
      'Wprowadź klucz danych użytkownika, np. `myFavoriteFieldName`',
    custom_field: {
      title: 'Dane niestandardowe',
      description:
        'Dowolne dodatkowe właściwości użytkownika, które możesz zdefiniować, aby spełnić unikalne wymagania Twojej aplikacji.',
    },
    type_required: 'Wybierz typ właściwości',
    create_button: 'Utwórz pole profilu',
  },
  details: {
    page_title: 'Szczegóły pola profilu',
    back_to_sie: 'Powrót do doświadczenia logowania',
    enter_field_name: 'Wprowadź nazwę pola profilu',
    delete_description: 'Tej akcji nie można cofnąć. Czy na pewno chcesz usunąć to pole profilu?',
    field_deleted: 'Pole profilu {{name}} zostało pomyślnie usunięte.',
    key: 'Klucz danych użytkownika',
    field_name: 'Nazwa pola',
    field_type: 'Typ pola',
    settings: 'Ustawienia',
    settings_description:
      'Dostosuj pola, aby zbierać więcej informacji o profilu użytkownika podczas rejestracji.',
    address_format: 'Format adresu',
    single_line_address: 'Adres w jednej linii',
    multi_line_address:
      'Adres w wielu liniach (np. Ulica, Miasto, Województwo, Kod pocztowy, Kraj)',
    components: 'Komponenty',
    components_tip: 'Wybierz komponenty, które mają tworzyć złożone pole.',
    label: 'Etykieta pola',
    label_placeholder: 'Etykieta',
    label_tip: 'Potrzebujesz lokalizacji? Dodaj języki w <a>Doświadczenie logowania > Treść</a>',
    label_tooltip:
      'Pływająca etykieta identyfikująca przeznaczenie pola. Pojawia się wewnątrz inputu i przesuwa się nad nim, gdy pole ma fokus lub wartość.',
    placeholder: 'Placeholder pola',
    placeholder_placeholder: 'Placeholder',
    placeholder_tooltip:
      'Przykład lub wskazówka formatu w polu. Zwykle pojawia się po uniesieniu etykiety; powinna być krótka (np. DD/MM/RRRR).',
    description: 'Opis pola',
    description_placeholder: 'Opis',
    description_tooltip:
      'Tekst pomocniczy pod polem tekstowym. Użyj do dłuższych instrukcji lub uwag dostępności.',
    options: 'Opcje',
    options_tip:
      'Wprowadź każdą opcję w nowej linii. Format: value:label (np. red:Red). Możesz podać samo value; jeśli label nie zostanie podany, wartość zostanie użyta jako etykieta.',
    options_placeholder: 'wartość1:etykieta1\nwartość2:etykieta2\nwartość3:etykieta3',
    regex: 'Wyrażenie regularne',
    regex_tip: 'Zdefiniuj wyrażenie regularne do walidacji wprowadzonych danych.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Format daty',
    date_format_us: 'MM/dd/yyyy (np. Stany Zjednoczone)',
    date_format_uk: 'dd/MM/yyyy (np. Wielka Brytania i Europa)',
    date_format_iso: 'yyyy-MM-dd (Międzynarodowy standard)',
    custom_date_format: 'Niestandardowy format daty',
    custom_date_format_placeholder: 'Wprowadź niestandardowy format daty. Np. "MM-dd-yyyy"',
    custom_date_format_tip:
      'Zobacz <a>date-fns</a> dokumentację dla prawidłowych tokenów formatowania.',
    input_length: 'Długość wprowadzania',
    value_range: 'Zakres wartości',
    min: 'Minimum',
    max: 'Maksimum',
    default_value: 'Wartość domyślna',
    checkbox_checked: 'Zaznaczono (True)',
    checkbox_unchecked: 'Odznaczono (False)',
    required: 'Wymagane',
    required_description:
      'Po włączeniu to pole musi być wypełnione przez użytkowników. Po wyłączeniu to pole jest opcjonalne.',
  },
};

export default Object.freeze(custom_profile_fields);
