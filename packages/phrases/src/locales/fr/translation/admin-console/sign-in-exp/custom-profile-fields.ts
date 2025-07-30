const custom_profile_fields = {
  table: {
    add_button: 'Ajouter un champ de profil',
    title: {
      field_label: 'Libellé du champ',
      type: 'Type',
      user_data_key: 'Clé dans le profil utilisateur',
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
    built_in_properties: 'Propriétés intégrées du profil utilisateur',
    custom_properties: 'Propriétés personnalisées',
    custom_data_field_name: 'Nom du champ de données personnalisé',
    custom_data_field_input_placeholder:
      'Entrez le nom du champ de données personnalisé, par exemple `monChampPrefere`',
    custom_field: {
      title: 'Champ de données personnalisé',
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
    composition_parts: 'Parties de composition',
    composition_parts_tip: 'Sélectionnez les parties pour composer le champ complexe.',
    label: "Libellé d'affichage",
    label_placeholder: 'Libellé',
    label_tip:
      'Besoin de localisation ? Ajoutez des langues dans <a>Expérience de connexion > Contenu</a>',
    placeholder: "Espace réservé d'affichage",
    placeholder_placeholder: 'Espace réservé',
    description: "Description d'affichage",
    description_placeholder: 'Description',
    options: 'Options',
    options_tip:
      'Entrez chaque option sur une nouvelle ligne. Utilisez un point-virgule pour séparer la clé et la valeur, par ex. `clé:valeur`',
    options_placeholder: 'valeur1:libellé1\nvaleur2:libellé2\nvaleur3:libellé3',
    regex: 'Expression régulière',
    regex_tip: 'Définissez une expression régulière pour valider la saisie.',
    regex_placeholder: '^[a-zA-Z0-9]+$',
    date_format: 'Format de date',
    date_format_us: 'États-Unis (MM/jj/aaaa)',
    date_format_uk: 'Royaume-Uni et Europe (jj/MM/aaaa)',
    date_format_iso: 'Norme internationale (aaaa-MM-jj)',
    custom_date_format: 'Format de date personnalisé',
    custom_date_format_placeholder: 'Entrez le format de date personnalisé. Par ex. "MM-jj-aaaa"',
    custom_date_format_tip:
      'Consultez la documentation <a>date-fns</a> pour les jetons de formatage valides.',
    input_length: 'Longueur de saisie',
    value_range: 'Plage de valeurs',
    min: 'Minimum',
    max: 'Maximum',
    required: 'Obligatoire',
    required_description:
      "Lorsqu'activé, ce champ doit être rempli par les utilisateurs. Lorsqu'désactivé, ce champ est facultatif.",
  },
};

export default Object.freeze(custom_profile_fields);
