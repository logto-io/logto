const profile = {
  name: '名前',
  avatar: 'アバター',
  givenName: '名',
  familyName: '姓',
  middleName: 'ミドルネーム',
  fullname: 'フルネーム',
  nickname: 'ニックネーム',
  preferredUsername: '希望ユーザー名',
  profile: 'プロフィール',
  website: 'ウェブサイト',
  gender: '性別',
  birthdate: '生年月日',
  zoneinfo: 'タイムゾーン',
  locale: 'ロケール',
  address: {
    formatted: '住所',
    streetAddress: '番地',
    locality: '市区町村',
    region: '都道府県',
    postalCode: '郵便番号',
    country: '国',
  },
  gender_options: {
    female: '女性',
    male: '男性',
    prefer_not_to_say: '答えたくない',
  },
  checkbox_value: {
    checked: 'はい',
    unchecked: 'いいえ',
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
