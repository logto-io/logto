const custom_profile_fields = {
  table: {
    add_button: 'Dodaj pole profilu',
    title: {
      field_label: 'Etykieta pola',
      type: 'Typ',
      user_data_key: 'Klucz w profilu użytkownika',
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
    built_in_properties: 'Wbudowane właściwości profilu użytkownika',
    custom_properties: 'Właściwości niestandardowe',
    custom_data_field_name: 'Nazwa niestandardowego pola danych',
    custom_data_field_input_placeholder:
      'Wprowadź nazwę niestandardowego pola danych, np. `mojaUlubionaNazwaPola`',
    custom_field: {
      title: 'Niestandardowe pole danych',
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
    composition_parts: 'Części składowe',
    composition_parts_tip: 'Wybierz części, które mają tworzyć złożone pole.',
    label: 'Wyświetlana etykieta',
    label_placeholder: 'Etykieta',
    label_tip: 'Potrzebujesz lokalizacji? Dodaj języki w <a>Doświadczenie logowania > Treść</a>',
    description: 'Wyświetlany opis',
    description_placeholder: 'Opis',
    options: 'Opcje',
    options_tip:
      'Wprowadź każdą opcję w nowej linii. Użyj średnika do oddzielenia klucza i wartości, np. `klucz:wartość`',
    options_placeholder: 'wartość1:etykieta1\nwartość2:etykieta2\nwartość3:etykieta3',
    regex: 'Wyrażenie regularne',
    regex_tip: 'Zdefiniuj wyrażenie regularne do walidacji wprowadzonych danych.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Format daty',
    date_format_us: 'Stany Zjednoczone (MM/dd/yyyy)',
    date_format_uk: 'Wielka Brytania i Europa (dd/MM/yyyy)',
    date_format_iso: 'Międzynarodowy standard (yyyy-MM-dd)',
    custom_date_format: 'Niestandardowy format daty',
    custom_date_format_placeholder: 'Wprowadź niestandardowy format daty. Np. "MM-dd-yyyy"',
    custom_date_format_tip:
      'Zobacz <a>date-fns</a> dokumentację dla prawidłowych tokenów formatowania.',
    input_length: 'Długość wprowadzania',
    value_range: 'Zakres wartości',
    min: 'Minimum',
    max: 'Maksimum',
    required: 'Wymagane',
    required_description:
      'Po włączeniu to pole musi być wypełnione przez użytkowników. Po wyłączeniu to pole jest opcjonalne.',
  },
};

export default Object.freeze(custom_profile_fields);
