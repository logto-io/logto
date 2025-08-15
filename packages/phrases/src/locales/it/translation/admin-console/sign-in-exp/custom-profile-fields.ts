const custom_profile_fields = {
  table: {
    add_button: 'Aggiungi campo profilo',
    title: {
      field_label: 'Etichetta campo',
      type: 'Tipo',
      user_data_key: 'Chiave dei dati utente',
    },
    placeholder: {
      title: 'Raccogli profilo utente',
      description:
        'Personalizza i campi per raccogliere più informazioni sul profilo utente durante la registrazione.',
    },
  },
  type: {
    Text: 'Testo',
    Number: 'Numero',
    Date: 'Data',
    Checkbox: 'Casella di controllo (Booleano)',
    Select: 'Menu a discesa (Selezione singola)',
    Url: 'URL',
    Regex: 'Espressione regolare',
    Address: 'Indirizzo (Composizione)',
    Fullname: 'Nome completo (Composizione)',
  },
  modal: {
    title: 'Aggiungi campo profilo',
    subtitle:
      'Personalizza i campi per raccogliere più informazioni sul profilo utente durante la registrazione.',
    built_in_properties: 'Dati utente di base',
    custom_properties: 'Dati utente personalizzati',
    custom_data_field_name: 'Chiave dei dati utente',
    custom_data_field_input_placeholder:
      'Inserisci la chiave dei dati utente, es. `myFavoriteFieldName`',
    custom_field: {
      title: 'Dati personalizzati',
      description:
        "Qualsiasi proprietà aggiuntiva dell'utente che puoi definire per soddisfare i requisiti unici della tua applicazione.",
    },
    type_required: 'Seleziona un tipo di proprietà',
    create_button: 'Crea campo profilo',
  },
  details: {
    page_title: 'Dettagli campo profilo',
    back_to_sie: "Torna all'esperienza di accesso",
    enter_field_name: 'Inserisci il nome del campo profilo',
    delete_description:
      'Questa azione non può essere annullata. Sei sicuro di voler eliminare questo campo profilo?',
    field_deleted: 'Il campo profilo {{name}} è stato eliminato con successo.',
    key: 'Chiave dati utente',
    field_name: 'Nome campo',
    field_type: 'Tipo campo',
    settings: 'Impostazioni',
    settings_description:
      'Personalizza i campi per raccogliere più informazioni sul profilo utente durante la registrazione.',
    address_format: 'Formato indirizzo',
    single_line_address: 'Indirizzo su una riga',
    multi_line_address: 'Indirizzo su più righe (Es. Via, Città, Stato, CAP, Paese)',
    components: 'Componenti',
    components_tip: 'Seleziona i componenti per comporre il campo complesso.',
    label: 'Etichetta del campo',
    label_placeholder: 'Etichetta',
    label_tip:
      'Hai bisogno di localizzazione? Aggiungi lingue in <a>Esperienza di accesso > Contenuto</a>',
    label_tooltip:
      'Etichetta flottante che identifica lo scopo del campo. Appare dentro l’input e si sposta sopra quando è a fuoco o contiene un valore.',
    placeholder: 'Segnaposto del campo',
    placeholder_placeholder: 'Segnaposto',
    placeholder_tooltip:
      'Esempio inline o suggerimento di formato mostrato nel campo. Di solito appare dopo che l’etichetta fluttua; mantienilo breve (es.: MM/DD/YYYY).',
    description: 'Descrizione del campo',
    description_placeholder: 'Descrizione',
    description_tooltip:
      'Testo di supporto mostrato sotto il campo di testo. Usalo per istruzioni più lunghe o note di accessibilità.',
    options: 'Opzioni',
    options_tip:
      'Inserisci ogni opzione su una nuova riga. Formato: value:label (es. red:Red). Puoi anche inserire solo value; se manca il label, il value viene mostrato come etichetta.',
    options_placeholder: 'valore1:etichetta1\nvalore2:etichetta2\nvalore3:etichetta3',
    regex: 'Espressione regolare',
    regex_tip: "Definisci un'espressione regolare per validare l'input.",
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Formato data',
    date_format_us: 'MM/dd/yyyy (es. Stati Uniti)',
    date_format_uk: 'dd/MM/yyyy (es. Regno Unito e Europa)',
    date_format_iso: 'yyyy-MM-dd (Standard internazionale)',
    custom_date_format: 'Formato data personalizzato',
    custom_date_format_placeholder: 'Inserisci il formato data personalizzato. Es. "MM-dd-yyyy"',
    custom_date_format_tip:
      'Consulta la documentazione di <a>date-fns</a> per i token di formattazione validi.',
    input_length: 'Lunghezza input',
    value_range: 'Intervallo valori',
    min: 'Minimo',
    max: 'Massimo',
    default_value: 'Valore predefinito',
    checkbox_checked: 'Selezionato (True)',
    checkbox_unchecked: 'Non selezionato (False)',
    required: 'Obbligatorio',
    required_description:
      'Se abilitato, questo campo deve essere compilato dagli utenti. Se disabilitato, questo campo è opzionale.',
  },
};

export default Object.freeze(custom_profile_fields);
