const profile = {
  name: 'Nom',
  avatar: 'Avatar',
  givenName: 'Prénom',
  familyName: 'Nom de famille',
  middleName: 'Deuxième prénom',
  fullname: 'Nom complet',
  nickname: 'Surnom',
  preferredUsername: "Nom d'utilisateur préféré",
  profile: 'Profil',
  website: 'Site web',
  gender: 'Genre',
  birthdate: 'Date de naissance',
  zoneinfo: 'Fuseau horaire',
  locale: 'Langue',
  address: {
    formatted: 'Adresse',
    streetAddress: 'Adresse',
    locality: 'Ville',
    region: 'État/Province',
    postalCode: 'Code postal',
    country: 'Pays',
  },
  gender_options: {
    female: 'Femme',
    male: 'Homme',
    prefer_not_to_say: 'Préfère ne pas dire',
  },
  checkbox_value: {
    checked: 'Oui',
    unchecked: 'Non',
  },
  avatar_upload: {
    upload: 'Importer',
    remove: 'Supprimer',
    uploading: 'Importation...',
    hint: 'Taille recommandée 1:1, jusqu’à {{limit}}.',
    error_file_type: 'Le type de fichier doit être {{extensions}}.',
    error_file_size: 'La taille du fichier ne doit pas dépasser {{limit}}.',
    error_upload: 'Échec du téléversement de la photo. Veuillez réessayer.',
  },
};

export default Object.freeze(profile);
