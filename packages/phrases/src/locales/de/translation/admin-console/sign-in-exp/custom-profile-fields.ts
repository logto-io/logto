const custom_profile_fields = {
  table: {
    add_button: 'Profilfeld hinzufügen',
    title: {
      field_label: 'Feldbezeichnung',
      type: 'Typ',
      user_data_key: 'Benutzerdatenschlüssel',
    },
    placeholder: {
      title: 'Benutzerprofil sammeln',
      description:
        'Passen Sie Felder an, um während der Registrierung mehr Benutzerprofilinformationen zu sammeln.',
    },
  },
  type: {
    Text: 'Text',
    Number: 'Zahl',
    Date: 'Datum',
    Checkbox: 'Checkbox (Boolescher Wert)',
    Select: 'Dropdown (Einzelauswahl)',
    Url: 'URL',
    Regex: 'Regulärer Ausdruck',
    Address: 'Adresse (Zusammensetzung)',
    Fullname: 'Vollständiger Name (Zusammensetzung)',
  },
  modal: {
    title: 'Profilfeld hinzufügen',
    subtitle:
      'Passen Sie Felder an, um während der Registrierung mehr Benutzerprofilinformationen zu sammeln.',
    built_in_properties: 'Grundlegende Benutzerdaten',
    custom_properties: 'Benutzerdefinierte Benutzerdaten',
    custom_data_field_name: 'Benutzerdatenschlüssel',
    custom_data_field_input_placeholder:
      'Geben Sie den Benutzerdatenschlüssel ein, z. B. `myFavoriteFieldName`',
    custom_field: {
      title: 'Benutzerdefinierte Daten',
      description:
        'Zusätzliche Benutzereigenschaften, die Sie definieren können, um die spezifischen Anforderungen Ihrer Anwendung zu erfüllen.',
    },
    type_required: 'Bitte wählen Sie einen Eigenschaftstyp aus',
    create_button: 'Profilfeld erstellen',
  },
  details: {
    page_title: 'Profilfeld-Details',
    back_to_sie: 'Zurück zur Anmeldeoberfläche',
    enter_field_name: 'Geben Sie den Profilfeldnamen ein',
    delete_description:
      'Diese Aktion kann nicht rückgängig gemacht werden. Möchten Sie dieses Profilfeld wirklich löschen?',
    field_deleted: 'Profilfeld {{name}} wurde erfolgreich gelöscht.',
    key: 'Benutzerdatenschlüssel',
    field_name: 'Feldname',
    field_type: 'Feldtyp',
    settings: 'Einstellungen',
    settings_description:
      'Passen Sie Felder an, um während der Registrierung mehr Benutzerprofilinformationen zu sammeln.',
    address_format: 'Adressformat',
    single_line_address: 'Einzeilige Adresse',
    multi_line_address: 'Mehrzeilige Adresse (z.B. Straße, Stadt, Bundesland, Postleitzahl, Land)',
    components: 'Komponenten',
    components_tip: 'Wählen Sie die Komponenten aus, um das komplexe Feld zusammenzusetzen.',
    label: 'Feldbezeichnung',
    label_placeholder: 'Bezeichnung',
    label_tip:
      'Benötigen Sie Lokalisierung? Fügen Sie Sprachen unter <a>Anmeldeoberfläche > Inhalt</a> hinzu',
    label_tooltip:
      'Schwebendes Label, das den Zweck des Feldes beschreibt. Es erscheint im Eingabefeld und bewegt sich darüber, sobald es fokussiert ist oder einen Wert enthält.',
    placeholder: 'Feld-Platzhalter',
    placeholder_placeholder: 'Platzhalter',
    placeholder_tooltip:
      'Inline‑Beispiel oder Format-Hinweis im Eingabefeld. Üblicherweise nach dem Schweben des Labels sichtbar; kurz halten (z. B. TT/MM/JJJJ).',
    description: 'Feldbeschreibung',
    description_placeholder: 'Beschreibung',
    description_tooltip:
      'Unter dem Textfeld angezeigter Hilfetext. Für längere Anweisungen oder Barrierefreiheitshinweise verwenden.',
    options: 'Optionen',
    options_tip:
      'Geben Sie jede Option in eine neue Zeile ein. Format: value:label (z. B. red:Red). Sie können auch nur value angeben; wenn kein Label vorhanden ist, wird der value als Label angezeigt.',
    options_placeholder: 'wert1:bezeichnung1\nwert2:bezeichnung2\nwert3:bezeichnung3',
    regex: 'Regulärer Ausdruck',
    regex_tip: 'Definieren Sie einen regulären Ausdruck, um die Eingabe zu validieren.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Datumsformat',
    date_format_us: 'MM/dd/yyyy (z.B. Vereinigte Staaten)',
    date_format_uk: 'dd/MM/yyyy (z.B. UK und Europa)',
    date_format_iso: 'yyyy-MM-dd (Internationaler Standard)',
    custom_date_format: 'Benutzerdefiniertes Datumsformat',
    custom_date_format_placeholder:
      'Geben Sie das benutzerdefinierte Datumsformat ein. Z.B. "MM-dd-yyyy"',
    custom_date_format_tip: 'Siehe <a>date-fns</a> Dokumentation für gültige Formatierungstokens.',
    input_length: 'Eingabelänge',
    value_range: 'Wertebereich',
    min: 'Minimum',
    max: 'Maximum',
    default_value: 'Standardwert',
    checkbox_checked: 'Aktiviert (True)',
    checkbox_unchecked: 'Deaktiviert (False)',
    required: 'Erforderlich',
    required_description:
      'Wenn aktiviert, muss dieses Feld von Benutzern ausgefüllt werden. Wenn deaktiviert, ist dieses Feld optional.',
  },
};

export default Object.freeze(custom_profile_fields);
