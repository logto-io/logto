const profile = {
  name: "Ім'я",
  avatar: 'Аватар',
  givenName: "Ім'я",
  familyName: 'Прізвище',
  middleName: 'По батькові',
  fullname: "Повне ім'я",
  nickname: 'Псевдонім',
  preferredUsername: "Бажане ім'я користувача",
  profile: 'Профіль',
  website: 'Вебсайт',
  gender: 'Стать',
  birthdate: 'Дата народження',
  zoneinfo: 'Часовий пояс',
  locale: 'Локаль',
  address: {
    formatted: 'Адреса',
    streetAddress: 'Вулиця',
    locality: 'Місто',
    region: 'Штат/Область',
    postalCode: 'Поштовий індекс',
    country: 'Країна',
  },
  gender_options: {
    female: 'Жіноча',
    male: 'Чоловіча',
    prefer_not_to_say: 'Волію не говорити',
  },
  checkbox_value: {
    checked: 'Так',
    unchecked: 'Ні',
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
