const profile = {
  name: 'Имя',
  avatar: 'Аватар',
  givenName: 'Имя',
  familyName: 'Фамилия',
  middleName: 'Отчество',
  fullname: 'Полное имя',
  nickname: 'Никнейм',
  preferredUsername: 'Предпочитаемое имя пользователя',
  profile: 'Профиль',
  website: 'Веб-сайт',
  gender: 'Пол',
  birthdate: 'Дата рождения',
  zoneinfo: 'Часовой пояс',
  locale: 'Язык',
  address: {
    formatted: 'Адрес',
    streetAddress: 'Улица',
    locality: 'Город',
    region: 'Штат/Область',
    postalCode: 'Почтовый индекс',
    country: 'Страна',
  },
  gender_options: {
    female: 'Женский',
    male: 'Мужской',
    prefer_not_to_say: 'Предпочитаю не говорить',
  },
  checkbox_value: {
    checked: 'Да',
    unchecked: 'Нет',
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
