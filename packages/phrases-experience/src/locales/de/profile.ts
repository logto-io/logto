const profile = {
  name: 'Name',
  avatar: 'Avatar',
  givenName: 'Vorname',
  familyName: 'Nachname',
  middleName: 'Zweitname',
  fullname: 'Vollständiger Name',
  nickname: 'Spitzname',
  preferredUsername: 'Bevorzugter Benutzername',
  profile: 'Profil',
  website: 'Webseite',
  gender: 'Geschlecht',
  birthdate: 'Geburtsdatum',
  zoneinfo: 'Zeitzone',
  locale: 'Sprache',
  address: {
    formatted: 'Adresse',
    streetAddress: 'Straßenadresse',
    locality: 'Stadt',
    region: 'Bundesland/Provinz',
    postalCode: 'Postleitzahl',
    country: 'Land',
  },
  gender_options: {
    female: 'Weiblich',
    male: 'Männlich',
    prefer_not_to_say: 'Keine Angabe',
  },
  checkbox_value: {
    checked: 'Ja',
    unchecked: 'Nein',
  },
  avatar_upload: {
    upload: 'Upload photo',
    replace: 'Replace photo',
    remove: 'Remove',
    uploading: 'Uploading...',
    error_file_type: 'File type must be {{extensions}}.',
    error_file_size: 'File size must not exceed {{limit}}.',
    error_upload: 'Failed to upload photo. Please try again.',
  },
};

export default Object.freeze(profile);
