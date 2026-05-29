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
    upload: 'Hochladen',
    remove: 'Entfernen',
    uploading: 'Wird hochgeladen...',
    hint: 'Empfohlene Größe 1:1, maximal {{limit}}.',
    error_file_type: 'Dateityp muss {{extensions}} sein.',
    error_file_size: 'Die Dateigröße darf {{limit}} nicht überschreiten.',
    error_upload: 'Foto konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.',
  },
};

export default Object.freeze(profile);
