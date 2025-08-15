const custom_profile_fields = {
  table: {
    add_button: 'Ajouter un champ de profil',
    title: {
      field_label: 'Libellé du champ',
      type: 'Type',
      user_data_key: 'Clé des données utilisateur',
    },
    placeholder: {
      title: 'Collecte du profil utilisateur',
      description:
        "Personnalisez les champs pour collecter plus d'informations sur le profil utilisateur lors de l'inscription.",
    },
  },
  type: {
    Text: 'Texte',
    Number: 'Nombre',
    Date: 'Date',
    Checkbox: 'Case à cocher (Booléen)',
    Select: 'Menu déroulant (Sélection unique)',
    Url: 'URL',
    Regex: 'Expression régulière',
    Address: 'Adresse (Composition)',
    Fullname: 'Nom complet (Composition)',
  },
  modal: {
    title: 'Ajouter un champ de profil',
    subtitle:
      "Personnalisez les champs pour collecter plus d'informations sur le profil utilisateur lors de l'inscription.",
    built_in_properties: 'Données utilisateur de base',
    custom_properties: 'Données utilisateur personnalisées',
    custom_data_field_name: 'Clé des données utilisateur',
    custom_data_field_input_placeholder:
      'Saisissez la clé des données utilisateur, p. ex. `myFavoriteFieldName`',
    custom_field: {
      title: 'Données personnalisées',
      description:
        'Toute propriété utilisateur supplémentaire que vous pouvez définir pour répondre aux besoins uniques de votre application.',
    },
    type_required: 'Veuillez sélectionner un type de propriété',
    create_button: 'Créer un champ de profil',
  },
  details: {
    page_title: 'Détails du champ de profil',
    back_to_sie: "Retour à l'expérience de connexion",
    enter_field_name: 'Entrez le nom du champ de profil',
    delete_description:
      'Cette action ne peut pas être annulée. Êtes-vous sûr de vouloir supprimer ce champ de profil ?',
    field_deleted: 'Le champ de profil {{name}} a été supprimé avec succès.',
    key: 'Clé des données utilisateur',
    field_name: 'Nom du champ',
    field_type: 'Type de champ',
    settings: 'Paramètres',
    settings_description:
      "Personnalisez les champs pour collecter plus d'informations sur le profil utilisateur lors de l'inscription.",
    address_format: "Format d'adresse",
    single_line_address: 'Adresse sur une ligne',
    multi_line_address:
      'Adresse sur plusieurs lignes (par ex. Rue, Ville, État, Code postal, Pays)',
    components: 'Composants',
    components_tip: 'Sélectionnez les composants pour composer le champ complexe.',
    label: 'Libellé du champ',
    label_placeholder: 'Libellé',
    label_tip:
      'Besoin de localisation ? Ajoutez des langues dans <a>Expérience de connexion > Contenu</a>',
    label_tooltip:
      "Libellé flottant identifiant l'usage du champ. Apparaît dans le champ puis se déplace au-dessus lorsqu'il est focalisé ou contient une valeur.",
    placeholder: 'Espace réservé du champ',
    placeholder_placeholder: 'Espace réservé',
    placeholder_tooltip:
      'Exemple inline ou indication de format affiché dans le champ. Apparaît généralement après que le libellé flotte et doit rester court (ex. JJ/MM/AAAA).',
    description: 'Description du champ',
    description_placeholder: 'Description',
    description_tooltip:
      'Texte d’aide affiché sous le champ. Utilisez-le pour des instructions plus longues ou des notes d’accessibilité.',
    options: 'Options',
    options_tip:
      'Saisissez chaque option sur une nouvelle ligne. Format : value:label (ex. red:Red). Vous pouvez aussi ne saisir que value ; si aucun label n’est fourni, la valeur sera utilisée comme libellé.',
    options_placeholder: 'valeur1:libellé1\nvaleur2:libellé2\nvaleur3:libellé3',
    regex: 'Expression régulière',
    regex_tip: 'Définissez une expression régulière pour valider la saisie.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Format de date',
    date_format_us: 'MM/dd/yyyy (par ex. États-Unis)',
    date_format_uk: 'dd/MM/yyyy (par ex. Royaume-Uni et Europe)',
    date_format_iso: 'yyyy-MM-dd (Norme internationale)',
    custom_date_format: 'Format de date personnalisé',
    custom_date_format_placeholder: 'Entrez le format de date personnalisé. Par ex. "MM-dd-yyyy"',
    custom_date_format_tip:
      'Consultez la documentation <a>date-fns</a> pour les jetons de formatage valides.',
    input_length: 'Longueur de saisie',
    value_range: 'Plage de valeurs',
    min: 'Minimum',
    max: 'Maximum',
    default_value: 'Valeur par défaut',
    checkbox_checked: 'Coché (True)',
    checkbox_unchecked: 'Décoché (False)',
    required: 'Obligatoire',
    required_description:
      "Lorsqu'activé, ce champ doit être rempli par les utilisateurs. Lorsqu'désactivé, ce champ est facultatif.",
  },
};

export default Object.freeze(custom_profile_fields);
